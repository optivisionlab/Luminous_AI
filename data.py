from database import db
from datetime import datetime

def read_users():
    return list(db.users.find({}))

def write_users(user_data):
    db.users.insert_one(user_data)

def find_user(username: str):
    return db.users.find_one({"username": username})

def read_questions():
    # Convert ObjectId to string for JSON serialization
    questions = []
    for q in db.questions.find({}):
        q['_id'] = str(q['_id'])
        questions.append(q)
    return questions

def write_questions(question_data):
    db.questions.insert_one(question_data)

def read_leaderboard():
    # Convert ObjectId to string for JSON serialization
    leaderboard = []
    for entry in db.leaderboard.find({}).sort("score", -1):
        entry['_id'] = str(entry['_id'])
        leaderboard.append(entry)
    return leaderboard

def update_leaderboard_entry(username: str, score: int):
    # Find existing entry or create a new one
    existing_entry = db.leaderboard.find_one({"username": username})
    if existing_entry:
        if score > existing_entry['score']:
            db.leaderboard.update_one({"username": username}, {"$set": {"score": score, "date": datetime.now().isoformat()}})
            return {"message": f"Điểm của {username} đã được cập nhật thành {score}"}
        else:
            return {"message": f"Điểm hiện tại của {username} là {existing_entry['score']}, không cần cập nhật."}
    else:
        db.leaderboard.insert_one({"username": username, "score": score, "date": datetime.now().isoformat()})
        return {"message": f"Người chơi {username} với điểm số {score} đã được thêm vào bảng xếp hạng."}
