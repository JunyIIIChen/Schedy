import os
import datetime
from flask import Flask, request, jsonify
# from langchain.chat_models import ChatOpenAI
# from langchain import PromptTemplate, LLMChain
from dotenv import load_dotenv
import jwt
from pymongo import MongoClient
from flask_cors import CORS
from flask_cors import cross_origin

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)



app.config['SECRET_KEY'] = 'this_is_my_secret_key'

load_dotenv()


@app.route('/')
def hello():
    return 'Hello, Flask!'


#~~~~~~~~Lim




#~~~~~~~HMX




#Patrick
# connect to MongoDB 
client = MongoClient("mongodb+srv://superadmin:superadmin@cluster0.mfjcg.mongodb.net/e-commerce?retryWrites=true&w=majority&appName=Cluster0")
db = client['scheduler']
users_collection = db['users']


# user signup route

@app.route("/signup", methods=["POST", "OPTIONS"])
@cross_origin(origin='http://localhost:3000', supports_credentials=True)
def signup():
    if request.method == 'OPTIONS':
        return '', 200  # 必须返回一个空 200 响应
    
    data = request.get_json()
    email = data.get("email")
    existing_user = users_collection.find_one({"email": email})
    if existing_user:
        return jsonify({"success": False, "error": "Existing user found with same email address."}), 400

    user = {
        "name": data.get("username"),
        "email": email,
        "password": data.get("password"),
        "date": datetime.datetime.now()
    }
    result = users_collection.insert_one(user)
    user_id = str(result.inserted_id)
    token = jwt.encode({"user": {"id": user_id}}, app.config['SECRET_KEY'], algorithm="HS256")
    return jsonify({"success": True, "token": token})

#user login route
@app.route("/login", methods=["POST", "OPTIONS"])
@cross_origin(origin='http://localhost:3000', supports_credentials=True)
def login():
    if request.method == 'OPTIONS':
        return '', 200  # 必须返回一个空 200 响应
    
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
            return jsonify({"success": False, "error": "Wrong Password"})
    else:
        return jsonify({"success": False, "error": "Wrong Email Id"})
    



# Parameters
# max_token
# temperature
# role
# context
# task

# 配置 LangChain 的模板和 LLMChain
# template = """
# Role: You are a professional restaurant scheduling manager.
# Context: We are a sushi restaurant located in Melbourne. The restaurant is open daily from 10 am to 8 pm.
# Output Format: Please present the schedule as an excel-like table with columns such as Day, Employee Name, Start Time, End Time.
# task: {task}
# max_token: 300
# Answer:
# """
# prompt = PromptTemplate(template=template, input_variables=["task"])
# llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0)
# llm_chain = LLMChain(prompt=prompt, llm=llm)

# @app.route("/ask", methods=["GET", "POST"])
# def ask():
#     # 固定问题：2018年举行奥运会的城市有多少人（英文）
#     task= "Help me to create a scheduling table for my employees for the coming week."
#     answer = llm_chain.run(task)
#     return jsonify({"task": task, "answer": answer})



# more route
@app.route('/api/data', methods=['GET'])
def get_data():
    data = {"message": "this is a response"}
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
