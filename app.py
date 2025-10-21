from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import data
import game_logic
from dotenv import load_dotenv
from database import db # Import db from new database.py

load_dotenv()

app = FastAPI()

# Configure CORS
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"), # Allow your Next.js frontend
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models for Request Body Validation ---
class UserRegister(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class SubmitAnswer(BaseModel):
    question_id: str # Changed from int to str
    answer: str
    current_score: int = 0
    username: str # Thêm trường username

class GameStart(BaseModel):
    username: str

class LeaderboardEntry(BaseModel):
    username: str
    score: int
    date: str

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

# --- API Endpoints ---

@app.get('/')
async def home():
    return {'message': 'Welcome to Who Wants to be a Millionaire AI Game (FastAPI)!'}

@app.post('/register')
async def register_user(user_data: UserRegister):
    username = user_data.username.strip()
    password = user_data.password.strip()

    if not username or not password:
        raise HTTPException(status_code=400, detail='Tên người dùng và mật khẩu là bắt buộc.')

    # Check if username already exists in MongoDB
    if data.find_user(username):
        raise HTTPException(status_code=409, detail='Tên người dùng đã tồn tại. Vui lòng chọn tên khác.')

    new_user_doc = {'username': username, 'password': password}
    data.write_users(new_user_doc) # Insert new user into MongoDB

    return {'message': 'User registered successfully'}

@app.post('/login')
async def login_user(user_data: UserLogin):
    username = user_data.username.strip()
    password = user_data.password.strip()

    if not username or not password:
        raise HTTPException(status_code=400, detail='Tên người dùng và mật khẩu là bắt buộc.')

    user = data.find_user(username)

    if not user or user['password'] != password:
        raise HTTPException(status_code=401, detail='Tên người dùng hoặc mật khẩu không hợp lệ.')

    return {'message': 'Login successful!'}

@app.post('/game/start')
async def start_game_session(game_start_data: GameStart):
    username = game_start_data.username.strip()
    if not username:
        raise HTTPException(status_code=400, detail='Tên người dùng là bắt buộc để bắt đầu trò chơi.')

    questions = game_logic.get_20_random_questions()
    if not questions:
        raise HTTPException(status_code=404, detail='Không đủ câu hỏi để bắt đầu trò chơi (cần tối thiểu 20 câu).')

    game_logic.active_game_sessions[username] = {
        'questions': questions,
        'current_index': 0
    }

    first_question = questions[0]
    return {'message': 'Phiên chơi game đã được bắt đầu.', 'question': first_question}

@app.get('/questions')
async def get_questions():
    questions = data.read_questions()
    if not questions:
        raise HTTPException(status_code=404, detail='Không có câu hỏi nào có sẵn.')
    return questions

@app.post('/leaderboard')
async def update_leaderboard(entry: LeaderboardEntry):
    username = entry.username.strip()
    score = entry.score

    if not username or score is None:
        raise HTTPException(status_code=400, detail='Tên người dùng và điểm số là bắt buộc.')

    # Sử dụng hàm update_player_score từ game_logic.py
    result = game_logic.update_player_score(username, score)
    return result

@app.get('/leaderboard')
async def get_leaderboard():
    leaderboard = data.read_leaderboard()
    if not leaderboard:
        raise HTTPException(status_code=404, detail='Bảng xếp hạng đang trống.')
    return leaderboard

@app.post('/game/answer')
async def submit_answer(answer_data: SubmitAnswer):
    question_id = answer_data.question_id
    submitted_answer = answer_data.answer.strip()
    current_score = answer_data.current_score
    username = answer_data.username # Lấy username từ request

    if not username:
        raise HTTPException(status_code=400, detail='Tên người dùng là bắt buộc để bắt đầu trò chơi.')

    if username not in game_logic.active_game_sessions:
        raise HTTPException(status_code=400, detail='Không tìm thấy phiên chơi game cho người dùng này. Vui lòng bắt đầu lại.')

    session = game_logic.active_game_sessions[username]
    current_question_from_session = session['questions'][session['current_index']]

    print(f"Backend session question ID: {current_question_from_session['id']}")
    print(f"Frontend submitted question ID: {question_id}")

    if current_question_from_session['id'] != question_id:
        raise HTTPException(status_code=400, detail='ID câu hỏi không khớp với phiên chơi hiện tại.')

    is_correct = game_logic.check_answer(question_id, submitted_answer)
    new_score = game_logic.calculate_score(current_score, is_correct)
    
    game_over = False
    next_question = None

    if not is_correct: # Nếu trả lời sai, game over và lưu điểm
        game_over = True
        game_logic.update_player_score(username, new_score) # Lưu điểm khi game over
        del game_logic.active_game_sessions[username] # Xóa phiên khi game over
    else:
        session['current_index'] += 1
        if session['current_index'] >= len(session['questions']):
            game_over = True
            game_logic.update_player_score(username, new_score) # Lưu điểm khi trả lời hết 20 câu
            del game_logic.active_game_sessions[username] # Xóa phiên khi game over
        else:
            next_question = session['questions'][session['current_index']]

    return {
        'question_id': question_id,
        'submitted_answer': submitted_answer,
        'is_correct': is_correct,
        'new_score': new_score,
        'message': 'Bạn đã trả lời đúng!' if is_correct else 'Bạn đã trả lời sai.',
        'game_over': game_over, # Thêm cờ game_over vào phản hồi
        'next_question': next_question # Gửi câu hỏi tiếp theo (nếu có)
    }
