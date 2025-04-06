from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello, Flask!'


#~~~~~~~~Lim




#~~~~~~~HMX




#Patrick

# more route
@app.route('/api/data', methods=['GET'])
def get_data():
    data = {"message": "this is a response"}
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
