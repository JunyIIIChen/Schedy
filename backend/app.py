import os
import datetime
import json
import re

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient
import jwt

from langchain.chat_models import ChatOpenAI
from langchain import PromptTemplate, LLMChain

app = Flask(__name__)
CORS(app)  # Allow Cross-Origin Requests

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


# --- LangChain Setup ---
template = """
Role: You are a professional restaurant scheduling manager.
Context: We are a sushi restaurant located in Melbourne. The restaurant is open daily from 10 am to 8 pm.
Output Format: Please present the schedule as an excel-like table with columns such as Day, Employee Name, Start Time, End Time, 
and also return the table as JSON.
Task: {task}
Max Token: 100
Answer:
"""
prompt = PromptTemplate(template=template, input_variables=["task"])
llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0)
llm_chain = LLMChain(prompt=prompt, llm=llm)


@app.route("/ask", methods=["GET", "POST"])
def ask():
    """
    Example endpoint to get a schedule in JSON format from the LangChain pipeline.
    We fix a 'task' about returning a scheduling table that can be parsed by json.load().
    """
    task = "Return a scheduling table that can be parsed by json.load function with fields: day, employee, start_time, end_time."
    answer_text = llm_chain.run(task)

    # Extract JSON (or array of JSON objects) from the AI-generated text
    parsed_answer = extract_all_json(answer_text)

    print('---------- Raw LLM Output ----------')
    print(answer_text)
    print('---------- Extracted JSON Type ----------')
    print(type(parsed_answer))
    print('------------------------------')

    return jsonify({"task": task, "answer": parsed_answer})


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
