import os
import datetime
import json
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient
import jwt
import uuid

from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.tools import tool
from langchain import hub

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# Set a salt key for JWT encoding/decoding
app.config['SECRET_KEY'] = 'this_is_my_secret_key'

# Load environment variables from .env file
load_dotenv()

# --- MongoDB Setup ---
# Connect to your MongoDB database
client = MongoClient(
    "mongodb+srv://superadmin:superadmin@cluster0.mfjcg.mongodb.net/"
    "e-commerce?retryWrites=true&w=majority&appName=Cluster0"
)
db = client['scheduler']
users_collection = db['users']
schedules_collection = db['schedules']
availabilities_collection = db['availabilities']


def extract_all_json(text: str):
    """
    Attempt to extract valid JSON objects or arrays from the given text.
    1. Tries to parse the entire text as JSON.
    2. If that fails, uses regex to find all JSON objects ({...}) and arrays ([...]) within the text.
    3. Returns:
       - A single parsed JSON if only one match is found,
       - A list of parsed JSON objects if multiple are found,
       - Or an error dict if no valid JSON can be extracted.
    """
    # 1) Try parsing the entire text directly
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # 2) Regex-based search for JSON objects ({...}) or arrays ([...])
    results = []
    json_patterns = [
        r'(\{.*?\})',  # Match JSON objects
        r'(\[.*?\])'   # Match JSON arrays
    ]
    for pattern in json_patterns:
        matches = re.findall(pattern, text, flags=re.DOTALL)
        for match in matches:
            try:
                parsed = json.loads(match)
                results.append(parsed)
            except json.JSONDecodeError:
                continue

    # 3) Decide what to return based on the number of matches
    if len(results) == 1:
        return results[0]  # Return the single JSON object/array
    elif len(results) > 1:
        return results     # Return a list of JSON objects/arrays
    else:
        # If no valid JSON was found, return the raw text with an error
        return {"error": "Failed to extract any valid JSON.", "raw_text": text}


@app.route('/')
def index():
    """Root endpoint to check if the application is running."""
    return 'Hello, Flask!'


@app.route("/signup", methods=["POST", "OPTIONS"])
def signup():
    """
    Handle user signup.
    Expects 'username', 'email', and 'password' in the POST body.
    Checks if a user with the same email already exists.
    Inserts new user data into MongoDB if not found.
    Returns a JWT token on success.
    """
    if request.method == "OPTIONS":
        # Preflight response for CORS
        return '', 204

    data = request.get_json()
    email = data.get("email")
    username = data.get("username")
    password = data.get("password")

    # Check if the user already exists
    existing_user = users_collection.find_one({"email": email})
    if existing_user:
        return jsonify({"success": False, "error": "User with this email already exists."}), 400

    # Create new user in the database
    user = {
        "name": username,
        "email": email,
        "password": password,
        "date": datetime.datetime.now()
    }
    result = users_collection.insert_one(user)
    user_id = str(result.inserted_id)

    # Generate JWT token
    token = jwt.encode({"user": {"id": user_id}}, app.config['SECRET_KEY'], algorithm="HS256")
    return jsonify({"success": True, "token": token})


@app.route("/login", methods=["POST", "OPTIONS"])
def login():
    """
    Handle user login.
    Expects 'email' and 'password' in the POST body.
    Checks if user exists in the database and if the password matches.
    Returns a JWT token on success.
    """
    if request.method == "OPTIONS":
        # Preflight response for CORS
        return '', 204

    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = users_collection.find_one({"email": email})
    if user:
        if user.get("password") == password:
            user_id = str(user["_id"])
            token = jwt.encode({"user": {"id": user_id}}, app.config['SECRET_KEY'], algorithm="HS256")
            return jsonify({"success": True, "token": token})
        else:
            return jsonify({"success": False, "error": "Incorrect password."})
    else:
        return jsonify({"success": False, "error": "User does not exist with this email."})




# auth to generate link
ALGORITHM = "HS256"
SECRET_KEY = app.config['SECRET_KEY']

def get_current_user():
    """
    Get the current user from the JWT token in the request headers.
    {
      "user_id": "...",
      "manager_id": "...",
      "company_id": "..."
    }
    """
    auth_header = request.headers.get("Authorization", None)

    if not auth_header:
        return None

    # 分割 Bearer token
    parts = auth_header.split()

    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None

    token = parts[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # payload 是你登录时 encode 的内容，比如 {"user_id": ..., "email": ...}
        print("Decoded JWT payload:", payload)
        return payload
    except jwt.ExpiredSignatureError:
        print("JWT has expired")
        return None
    except jwt.InvalidTokenError:
        print("JWT is invalid")
        return None


@app.route("/api/schedule", methods=["POST"])
def create_schedule():
    """
    Create a new schedule.
    """
    current_user = get_current_user()  # 从JWT/Session解析
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401

    users_id = current_user["user"]["id"]
    print("Current User ID:", users_id)
    schedule_id = str(uuid.uuid4())

    # 插入MongoDB
    doc = {
        "schedule_id": schedule_id,
        "users_id": users_id,
        "created_at": datetime.datetime.now(),
        "status": "collecting"
    }
    schedules_collection.insert_one(doc)

    return jsonify({"schedule_id": schedule_id}), 201

@app.route("/api/availability/<string:schedule_id>", methods=["POST"])
def submit_availability(schedule_id):
    """
    员工提交可用时间（不需要登录）
    URL 中包含 schedule_id,数据会写入 availabilities_collection
    """
    try:
        data = request.get_json()

        employee_name = data.get("name")
        employee_email = data.get("email")
        availability = data.get("availability")
        preference = data.get("preference")

        # 简单字段校验
        if not employee_name or not availability:
            return jsonify({"error": "Missing name or availability"}), 400

        # 构建文档
        doc = {
            "schedule_id": schedule_id,
            "employee_name": employee_name,
            "employee_email": employee_email,
            "availability": availability,
            "preference": preference,
            "submitted_at": datetime.datetime.now()
        }

        availabilities_collection.insert_one(doc)

        return jsonify({"message": "Availability submitted successfully"}), 200

    except Exception as e:
        print("Error submitting availability:", str(e))
        return jsonify({"error": "Server error"}), 500



# --- LangChain Setup ---
template = """
Role: You are a professional restaurant scheduling manager.
Context: We are a sushi restaurant located in Melbourne. The restaurant is open daily from 10 am to 8 pm. Please generate next week schedule.
Output Format: Please present the schedule as an excel-like table with columns ID, Employee Name, Email,Start Time like ISO format, End Time, 
and also return the table as JSON.
Task: {task}
Max Token: 100
Answer:
"""
prompt = PromptTemplate(template=template, input_variables=["task"])
llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0)
chain = prompt | llm


@app.route("/as", methods=["GET", "POST"])
def asfas():
    schedule_data = [
        {
            'name': 'Team Meeting',
            'email': 'asdasda@gmail.com',
            "End Time": "2025-04-17T22:00:00",
            'id': 1,
            "Start Time": "2025-04-17T21:00:00"
        },
        {
            'name': 'Lunch Appointment',
            'email': 'asdasda@gmail.com',
            "End Time": "2025-04-18T12:00:00",
            'id': 2,
            "Start Time": "2025-04-18T11:00:00"
        },
        {
            'name': 'All Day Conference',
            'email': 'asdasda@gmail.com',
            "End Time": "2025-04-19T11:00:00",
            'id': 3,
            "Start Time": "2025-04-19T10:00:00"
        }
    ]
    return jsonify(schedule_data)


@app.route("/ask", methods=["GET", "POST"])
def ask():
    """
    Example endpoint to get a schedule in JSON format from the LangChain pipeline.
    We fix a 'task' about returning a scheduling table that can be parsed by json.load().
    """
    task = "Return a scheduling table that can be parsed by json.load function with fields:ID, Employee Name, Email，Start Time like this ISO format (2025-04-17T12:00:00), End Time."
    answer_text = chain.invoke({"task": task})

    # Extract JSON (or array of JSON objects) from the AI-generated text
    raw_output = answer_text.content if hasattr(answer_text, "content") else str(answer_text)
    
    parsed_answer = extract_all_json(raw_output)

    print('---------- Raw LLM Output ----------')
    print(raw_output)
    print('---------- Extracted JSON Type ----------')
    print(type(parsed_answer))
    print('------------------------------')

    return jsonify({"task": task, "answer": parsed_answer})




custom_context = """
Role: You are a professional restaurant scheduling manager.
Context: We are a sushi restaurant located in Melbourne. The restaurant is open daily from 10 am to 8 pm.
Please generate the schedule for next week.

Output Format: Please present the schedule as an excel-like table with columns:
- ID
- Employee Name
- Email
- Start Time (ISO format)
- End Time (ISO format)

Also return the schedule as valid JSON that can be parsed by json.loads().
"""
react_prompt = hub.pull("hwchase17/react")

# Inject your context above the classic ReAct prompt
react_prompt.template = f"{custom_context.strip()}\n\n{react_prompt.template}"

print("Prompt Template:", react_prompt.template)

tools = [
    # Add your tools here
    #自动查数据 做排班
    #自动下发排班通知
]

# agent model
@app.route("/api/agent", methods=["POST"])
def agent():
    """
    Example endpoint to get a schedule in JSON format from the LangChain pipeline.
    We fix a 'task' about returning a scheduling table that can be parsed by json.load().
    """
    task = "Return a scheduling table that can be parsed by json.load function with fields:ID, Employee Name, Email,Start Time like this ISO format (2025-04-17T12:00:00), End Time."
    
    llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0)

    agent = initialize_agent(
        tools=tools,
        llm=llm,
        agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        prompt=react_prompt,
        verbose=True
    )

    agent.invoke({
    "input": task,
    "chat_history": [],  # 可选
    "tool_input": {}     # 可选，除非你要控制 tool input
    })










@app.route('/api/data', methods=['GET'])
def get_data():
    """
    Example endpoint to demonstrate a simple JSON response.
    """
    data = {"message": "This is a response from /api/data endpoint."}
    return jsonify(data)


if __name__ == '__main__':
    # Run Flask in debug mode on port 5001
    app.run(debug=True, port=5001)
