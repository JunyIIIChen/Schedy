Working Schedule AI Assistant
An intelligent employee scheduling assistant for small business owners.
This app helps you set operational hours, gather employee availability, and automatically generate optimized shift schedules using AI.

📂 Project Structure

working_schedule/
├── frontend/           # React frontend
│   ├── public/
│   └── src/
├── backend/            # Flask backend

✨ Features
🕒 Configure weekly operation times and worker counts

🧑‍🤝‍🧑 Collect employee availability through shared links

🤖 Automatically generate optimized schedules using OpenAI

🌐 Responsive and modern UI built with React + Ant Design

🔐 JWT authentication system

🚀 Getting Started
1. Clone the repository

git clone https://github.com/JunyIIIChen/working_schedule.git
cd working_schedule

3. Start the Frontend

cd frontend
npm install
npm start
Frontend runs on: http://localhost:3000

4. Start the Backend (Flask)
Ensure Python 3.8+ is installed.

cd backend
pip install -r requirements.txt
python app.py
Backend runs on: http://localhost:5001

📦 Tech Stack
Frontend: React, Ant Design, Lottie, React Router

Backend: Flask, JWT, MongoDB

AI Integration: OpenAI GPT via LangChain or API

Authentication: JWT + Role-Based Access


🛡️ Environment Variables
Create a .env file in backend, insert your OPENAI_API_KEY
OPENAI_API_KEY=your_openai_key

Start to explore our unique solutions!
