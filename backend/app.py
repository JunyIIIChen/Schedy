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
from bson.objectid import ObjectId
from bson import json_util
import json

from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain.agents import initialize_agent, AgentType
from langchain.tools import tool
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
chat_collection = db['chat_histories']



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
        # print("Decoded JWT payload:", payload)
        return payload
    except jwt.ExpiredSignatureError:
        # print("JWT has expired")
        return None
    except jwt.InvalidTokenError:
        # print("JWT is invalid")
        return None

@app.route("/api/basic", methods=["POST"])
def basic_information():
    current_user = get_current_user()
    # print('---------------------')
    # print(current_user)
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401

    user = users_collection.find_one({"_id": ObjectId(current_user["user"]["id"])})


    # print('---------------------')
    # print(user)
    # print(type(user))

    user_json = json.loads(json_util.dumps(user))

    # Remove sensitive data (like password) before sending
    user_json.pop('password', None)
    user_json.pop('date', None)

    # print('---------------------')
    # print(user_json)
    # print(type(user_json))

    return jsonify(user_json), 200

@app.route("/api/update_user", methods=["POST"])
def update_user():
    try:
        data = request.get_json()
        print('---------------------')

        user_id = data["updates"]["_id"]["$oid"]
        updates = data["updates"]


        # Check if _id is valid
        if not ObjectId.is_valid(ObjectId(user_id)):
            return jsonify({"error": "Invalid ID format"}), 400

        # Remove _id if present to avoid modifying it
        updates.pop("_id", None)
        result = db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": updates}
        )

        if result.modified_count == 1:
            return jsonify({"success": True, "message": "User updated"})
        else:
            return jsonify({"success": False, "message": "No changes made"}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


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



# -----------------------------
# JSON 提取工具
# -----------------------------
def extract_all_json(text):
    try:
        return json.loads(text)
    except:
        match = re.search(r'\[\s*{.+?}\s*\]', text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except:
                return None
    return None

# -----------------------------
# 日期修改工具
# -----------------------------
def get_next_week_range():
    today = datetime.date.today()
    next_monday = today + datetime.timedelta(days=(7 - today.weekday()))
    next_sunday = next_monday + datetime.timedelta(days=6)
    return next_monday.isoformat(), next_sunday.isoformat()


# -----------------------------
# 全局变量
# -----------------------------
chat_histories = {}
schedule_requirements = {}
TRIGGER_WORDS = ["start scheduling", "generate schedule", "run schedule", "开始排班"]

llm = ChatOpenAI(model_name="gpt-4o", temperature=0)

SYSTEM_PROMPT = (
    "You are a helpful AI scheduling assistant.\n"
    "1. First call the tool `fetch_availability` to retrieve employee availability.\n"
    "2. Then generate a weekly schedule based on:\n"
    "   - business hours\n"
    "   - user scheduling requirements\n"
    "   - employee availability (from the tool)\n\n"
    "Output format must be a JSON array like this:\n"
    "[{'id': 1, 'employee': 'Alice', 'email': 'alice@example.com', 'start': '2025-04-21T10:00:00', 'end': '2025-04-21T16:00:00'}]"
)

# -----------------------------
# 工具生成器
# -----------------------------
def create_fetch_availability_tool():
    @tool
    def fetch_availability(schedule_id: str) -> str:
        """Fetch all employee availability by schedule_id."""
        if not re.fullmatch(r"[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}", schedule_id, re.I):
            return json.dumps({"error": "invalid UUID format"})

        result = []
        documents = availabilities_collection.find({"schedule_id": schedule_id})
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
        func=fetch_availability,
        name="fetch_availability",
        description="Fetch availability data for the given schedule_id"
    )
# -----------------------------
# 主聊天接口
# -----------------------------
@app.route("/api/schedule-agent", methods=["POST"])
def schedule_agent():
    data = request.get_json()
    schedule_id = data.get("schedule_id")
    user_input = data.get("message", "")

    if not schedule_id or not user_input:
        return jsonify({"error": "Missing schedule_id or message"}), 400

    chat_collection.update_one(
        {"schedule_id": schedule_id},
        {"$push": {"history": {"role": "user", "content": user_input}}},
        upsert=True
    )
    triggered = any(word in user_input.lower() for word in TRIGGER_WORDS)

    if not triggered:
        ai_reply = llm.predict(f"{user_input}")
        schedule_requirements.setdefault(schedule_id, []).append(user_input)
        chat_collection.update_one(
            {"schedule_id": schedule_id},
            {"$push": {"history": {"role": "ai", "content": ai_reply}}}
        )
        return jsonify({"response": ai_reply})

    tool = create_fetch_availability_tool()
    agent = initialize_agent(
        tools=[tool],
        llm=llm,
        agent=AgentType.OPENAI_FUNCTIONS,
        prompt=SYSTEM_PROMPT,
        verbose=True
    )

    requirements = "\n".join(schedule_requirements.get(schedule_id, []))
    result = agent.invoke({
        "input": f"""
        User has collected these scheduling requirements:
        {requirements}
        Schedule ID: {schedule_id}
        Generate the schedule now.
        """,
        "schedule_id": schedule_id
    })

    ai_reply = result["output"]
    chat_collection.update_one(
        {"schedule_id": schedule_id},
        {"$push": {"history": {"role": "ai", "content": ai_reply}}}
    )

    json_schedule = extract_all_json(ai_reply)
    print("~~~~~~~~Extracted JSON:", json_schedule)
    print("~~~~~~~~Type of JSON:", type(json_schedule))

    return jsonify({
        "response": ai_reply,
        "schedule_data": json_schedule
    })


# -----------------------------
# 查看日历接口（从聊天记录生成 JSON） now is working
# -----------------------------
@app.route("/api/view-calendar", methods=["POST"])
def view_calendar():
    data = request.get_json()
    schedule_id = data.get("schedule_id")

    if not schedule_id:
        return jsonify({"error": "Missing schedule_id"}), 400

    # 获取聊天记录
    record = chat_collection.find_one({"schedule_id": schedule_id})
    history = record.get("history", []) if record else []

    if not history:
        return jsonify({"error": "No chat history found for this schedule_id"}), 404

    messages = "\n".join([f"{m['role']}: {m['content']}" for m in history])

    # 获取可用时间数据
    documents = availabilities_collection.find({"schedule_id": schedule_id})
    availability_data = []
    for doc in documents:
        employee = doc.get("employee_name", "")
        email = doc.get("employee_email", "")
        availability = doc.get("availability", {})
        preference = doc.get("preference", {})
        availability_data.append({
            "employee": employee,
            "email": email,
            "availability": availability,
            "preference": preference
        })

    # 🗓️ 获取下周日期范围
    today = datetime.date.today()
    next_monday = today + datetime.timedelta(days=(7 - today.weekday()))
    next_sunday = next_monday + datetime.timedelta(days=6)
    start_date = next_monday.isoformat()
    end_date = next_sunday.isoformat()

    prompt = f"""
You are a professional scheduling assistant.
Here is the full chat history:
{messages}

Here is the employee availability data:
{json.dumps(availability_data, indent=2)}

Now based on both the chat and employee availability, generate the schedule for the week from {start_date} to {end_date}.
Return only a valid JSON array like:
[
  {{"id": 1, "employee": "Alice", "email": "alice@example.com", "start": "{start_date}T10:00:00", "end": "{start_date}T16:00:00"}}
]
"""

    raw_output = llm.invoke(prompt)
    content = raw_output.content if hasattr(raw_output, "content") else str(raw_output)
    extracted = extract_all_json(content)

    return jsonify({
        "calendar_json": extracted,
        "raw": content,
        "availabilities_count": len(availability_data)
    })


if __name__ == '__main__':
    # Run Flask in debug mode on port 5001
    app.run(debug=True, port=5001)
