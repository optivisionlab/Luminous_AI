import pandas as pd
import random
from data import read_questions, read_leaderboard, write_leaderboard
from datetime import datetime

# Dictionary to store active game sessions
# Key: username, Value: {'questions': list of 20 questions, 'current_index': int}
active_game_sessions = {}

def get_20_random_questions():
    questions_df = read_questions()
    if questions_df.empty or len(questions_df) < 20:
        return None # Not enough questions
    return questions_df.sample(20).to_dict(orient='records')

def get_random_question():
    questions_df = read_questions()
    if questions_df.empty:
        return None
    return questions_df.sample(1).iloc[0].to_dict()

def check_answer(question_id, submitted_answer):
    questions_df = read_questions()
    question = questions_df[questions_df['id'] == question_id]
    if not question.empty:
        correct_answer = question.iloc[0]['correct_answer']
        return submitted_answer == correct_answer
    return False

def calculate_score(current_score, is_correct):
    if is_correct:
        return current_score + 100 # Ví dụ: mỗi câu trả lời đúng được 100 điểm
    return current_score

def update_player_score(username: str, score: int):
    leaderboard_df = read_leaderboard()
    current_date = datetime.now().isoformat()

    # Lọc các bản ghi của người chơi hiện tại
    user_entries = leaderboard_df[leaderboard_df['username'].str.lower() == username.lower()]

    if not user_entries.empty:
        # Người chơi đã tồn tại, kiểm tra điểm cao nhất
        highest_score_existing = user_entries['score'].max()

        if score > highest_score_existing:
            # Nếu điểm mới cao hơn, xóa tất cả các bản ghi cũ của người chơi này
            leaderboard_df = leaderboard_df[leaderboard_df['username'].str.lower() != username.lower()]
            # Thêm bản ghi mới với điểm cao hơn
            new_entry = pd.DataFrame([{'username': username, 'score': score, 'date': current_date}])
            leaderboard_df = pd.concat([leaderboard_df, new_entry], ignore_index=True)
            write_leaderboard(leaderboard_df)
            return {'message': 'Leaderboard updated with new high score'}
        else:
            return {'message': 'Current score is not higher than existing high score'}
    else:
        # Người chơi chưa tồn tại, thêm bản ghi mới
        new_entry = pd.DataFrame([{'username': username, 'score': score, 'date': current_date}])
        leaderboard_df = pd.concat([leaderboard_df, new_entry], ignore_index=True)
        write_leaderboard(leaderboard_df)
        return {'message': 'New entry added to leaderboard'}
