from flask import Flask, request, jsonify
from langchain.chat_models import ChatOpenAI
from langchain import PromptTemplate, LLMChain
from dotenv import load_dotenv


app = Flask(__name__)

load_dotenv()

@app.route('/')
def hello():
    return 'Hello, Flask!'


#~~~~~~~~Lim




#~~~~~~~HMX




#Patrick

# Parameters
# max_token
# temperature
# role
# context
# task

# 配置 LangChain 的模板和 LLMChain
template = """
Role: You are a professional restaurant scheduling manager.
Context: We are a sushi restaurant located in Melbourne. The restaurant is open daily from 10 am to 8 pm.
Output Format: Please present the schedule as an excel-like table with columns such as Day, Employee Name, Start Time, End Time.
task: {task}
max_token: 300
Answer:
"""
prompt = PromptTemplate(template=template, input_variables=["task"])
llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0)
llm_chain = LLMChain(prompt=prompt, llm=llm)

@app.route("/ask", methods=["GET", "POST"])
def ask():
    # 固定问题：2018年举行奥运会的城市有多少人（英文）
    task= "Help me to create a scheduling table for my employees for the coming week."
    answer = llm_chain.run(task)
    return jsonify({"task": task, "answer": answer})



# more route
@app.route('/api/data', methods=['GET'])
def get_data():
    data = {"message": "this is a response"}
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
