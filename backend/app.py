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
# 配置 LangChain 的模板和 LLMChain
template = """Question: {question}
Let's think step by step.
Answer: """
prompt = PromptTemplate(template=template, input_variables=["question"])
llm = ChatOpenAI(model_name="gpt-4o-mini")
llm_chain = LLMChain(prompt=prompt, llm=llm)

@app.route("/ask", methods=["GET", "POST"])
def ask():
    # 固定问题：2018年举行奥运会的城市有多少人（英文）
    question = "What is the population of the city that hosted the Olympics in 2020?"
    answer = llm_chain.run(question)
    return jsonify({"question": question, "answer": answer})



# more route
@app.route('/api/data', methods=['GET'])
def get_data():
    data = {"message": "this is a response"}
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
