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
from langchain.agents import initialize_agent, AgentType
from langchain.memory import ConversationBufferMemory
from langchain.tools import tool
from langchain import hub
from langchain.tools import StructuredTool
from langchain.agents import Tool



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











# --- LangChain Setup ---
@app.route("/ask", methods=["GET", "POST"])
def ask():
    data = request.get_json()
    chat_histories = data.get("chat_history")

    # Get user
    # user = users_collection.find_one({"id": id}) 

    # user_business_hour = user.get("business_hour")
    

    # user_name = user.get("name")
    # user_location = user.get("user_location")
    # user_industry = user.get("user_industry")


    user_name = "Hugo Boss"
    user_location = "Melbourne"
    user_industry = "Restaurant"
    user_business_hours = {"business_hours": [
    { "day": "Monday",    "open": "08:00", "close": "19:00", "workers_required": 7, "day_off": False },
    { "day": "Tuesday",   "open": "08:00", "close": "19:00", "workers_required": 7, "day_off": True },
    { "day": "Wednesday", "open": "08:00", "close": "19:00", "workers_required": 7, "day_off": False },
    { "day": "Thursday",  "open": "08:00", "close": "19:00", "workers_required": 7, "day_off": False },
    { "day": "Friday",    "open": "08:00", "close": "19:00", "workers_required": 7, "day_off": False },
    { "day": "Saturday",  "open": "08:00", "close": "19:00", "workers_required": 7, "day_off": False },
    { "day": "Sunday",    "open": "08:00", "close": "19:00", "workers_required": 7, "day_off": False }
    ]}

    # prompt
    template = f"""
    Role: You are a shift scheduling assistant.

    Basic Info:
    - Business Name: {user_name} 
    - Location: {user_location}  
    - Industry: {user_industry}

    Business Hours & Staffing Requirements:
    {json.dumps(user_business_hours, indent=2)}

    Scheduling Task:
    Based on the business hours and user requests below, generate a shift schedule for next week. Ensure staffing matches the "workers_required" for each day, and respect "day_off" if true.

    User Requests from Previous Conversation:
    {chat_histories}

    Output Format:
    Return only JSON array like this:
    [
    {{
        "id": 1,
        "employee": "Alice",
        "email": "alice@example.com",
        "start": "2025-04-21T10:00:00",
        "end": "2025-04-21T16:00:00"
    }},
    ...
    ]
    """

    llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0, max_tokens=500)

    answer_text = llm.invoke(template)

    raw_output = answer_text.content if hasattr(answer_text, "content") else str(answer_text)
    parsed_answer = extract_all_json(raw_output)

    print('---------- Raw LLM Output ----------')
    print(raw_output)
    print('---------- Extracted JSON Type ----------')
    print(type(parsed_answer))
    print('------------------------------')

    return jsonify({"answer": parsed_answer})


# -----------------------------
# Global Variables
# -----------------------------
chat_histories = {}
schedule_requirements = {}  # optional: to store structured user requests

TRIGGER_WORDS = ["start scheduling", "generate schedule", "run schedule", "开始排班"]

# -----------------------------
# LLM
# -----------------------------
llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0)

SYSTEM_PROMPT = (
    "You are a helpful AI scheduling assistant.\n"
    "Your job is to:\n"
    "1. First **call the tool `fetch_availability`** to retrieve employee availability.\n"
    "2. Then generate a weekly schedule based on:\n"
    "   - business hours\n"
    "   - user scheduling requirements\n"
    "   - employee availability (from the tool)\n\n"
    "Output format must be a JSON array like this:\n"
    "Do not guess availability, always use the tool."
)


# -----------------------------
# Tool Generator
# -----------------------------
def create_fetch_availability_tool(current_schedule_id: str):
    @tool
    def _fetch_availability(_: str = "") -> str:
        """Fetch all employee availability for current schedule_id."""
        if not re.fullmatch(r"[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}", current_schedule_id, re.I):
            return json.dumps({"error": "invalid UUID format"})

        result = []
        documents = availabilities_collection.find({"schedule_id": current_schedule_id})
        for doc in documents:
            employee = doc.get("employee_name", "")
            email = doc.get("employee_email", "")
            availability = doc.get("availability", {})

            for day, time in availability.items():
                if not isinstance(time, dict):
                    continue
                start = time.get("start")
                end = time.get("end")
                if start and end:
                    result.append({
                        "employee": employee,
                        "email": email,
                        "day": day.capitalize(),
                        "start": start,
                        "end": end
                    })
        return json.dumps(result, indent=2) or "[]"

    return Tool.from_function(
        func=_fetch_availability,
        name="fetch_availability",
        description="Fetch all employees' availability for current schedule_id"
    )

# -----------------------------
# Helper
# -----------------------------
def history_str(history):
    return "\n".join(f"{turn['role'].capitalize()}: {turn['content']}" for turn in history)

# -----------------------------
# API Endpoint
# -----------------------------
@app.route("/api/agent-chat", methods=["POST"])
def agent_chat():
    data = request.get_json()
    schedule_id = data.get("schedule_id")
    user_input = data.get("message", "")

    if not schedule_id or not user_input:
        return jsonify({"error": "missing params"}), 400

    # Save user message to history
    chat_histories.setdefault(schedule_id, []).append({"role": "user", "content": user_input})
    triggered = any(word in user_input.lower() for word in TRIGGER_WORDS)

    if not triggered:
        # Normal chat - collect requirements
        ai_reply = llm.predict(f"{history_str(chat_histories[schedule_id])}\nUser: {user_input}\nAssistant:")
        schedule_requirements.setdefault(schedule_id, []).append(user_input)
    else:
        # Trigger scheduling - create dynamic tool
        dynamic_tool = create_fetch_availability_tool(schedule_id)
        agent = initialize_agent(
            tools=[dynamic_tool],  # ✅ 这里包含 tool
            llm=llm,
            agent=AgentType.OPENAI_FUNCTIONS,
            prompt=SYSTEM_PROMPT,
            verbose=True
    )


        # Optional: include requirements in context
        result = agent.invoke({
            "input": f"""
        User has collected these scheduling requirements:\n
        {schedule_requirements.get(schedule_id, [])}\n
        Now use employee availability to generate a weekly schedule.
        """
        })

        ai_reply = result["output"]

    # Save AI reply
    chat_histories[schedule_id].append({"role": "ai", "content": ai_reply})

    return jsonify({
        "response": ai_reply,
        **({"chat_history": chat_histories[schedule_id]} if triggered else {})
    })

if __name__ == '__main__':
    # Run Flask in debug mode on port 5001
    app.run(debug=True, port=5001)
