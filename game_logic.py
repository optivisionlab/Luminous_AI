import random
from data import read_questions, update_leaderboard_entry, find_user # Updated imports
from datetime import datetime
from bson.objectid import ObjectId # Import ObjectId
from database import db # Import db directly from database.py

# Dictionary to store active game sessions
# Key: username, Value: {'questions': list of 20 questions, 'current_index': int}
active_game_sessions = {}

def get_20_random_questions():
    questions = read_questions() # Get all questions from MongoDB
    if not questions or len(questions) < 20:
        return None # Not enough questions
    
    # Select 20 random questions
    random_questions = random.sample(questions, 20)
    
    # Convert ObjectId to string 'id' for consistency with frontend expectations
    formatted_questions = []
    for q in random_questions:
        q_copy = q.copy()
        q_copy['id'] = str(q_copy['_id'])
        del q_copy['_id'] # Remove original _id field
        formatted_questions.append(q_copy)
    return formatted_questions

def check_answer(question_id, submitted_answer):
    # Need to convert question_id string back to ObjectId for MongoDB query
    try:
        obj_id = ObjectId(question_id)
    except:
        return False # Invalid ObjectId

    question = db.questions.find_one({'_id': obj_id})
    if question:
        correct_answer = question['correct_answer']
        return submitted_answer == correct_answer
    return False

def calculate_score(current_score, is_correct):
    if is_correct:
        return current_score + 100 # Ví dụ: mỗi câu trả lời đúng được 100 điểm
    return current_score

def update_player_score(username: str, score: int):
    # Use the new update_leaderboard_entry from data.py
    return update_leaderboard_entry(username, score)
