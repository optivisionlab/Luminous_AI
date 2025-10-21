import pandas as pd
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# MongoDB Connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client.luminous_ai_db  # Use the same database name as in app.py

# CSV File Paths
USERS_FILE = 'users.csv'
QUESTIONS_FILE = 'questions.csv'
LEADERBOARD_FILE = 'leaderboard.csv'

def read_csv_safe(file_path, columns):
    if os.path.exists(file_path):
        return pd.read_csv(file_path)
    return pd.DataFrame(columns=columns)

def migrate_users():
    print(f"Migrating users from {USERS_FILE}...")
    users_df = read_csv_safe(USERS_FILE, ['username', 'password'])
    if not users_df.empty:
        # Clear existing users in MongoDB to prevent duplicates
        db.users.delete_many({})
        users_data = users_df.to_dict(orient='records')
        db.users.insert_many(users_data)
        print(f"Migrated {len(users_data)} users.")
    else:
        print("No users data found in CSV to migrate.")

def migrate_questions():
    print(f"Migrating questions from {QUESTIONS_FILE}...")
    questions_df = read_csv_safe(QUESTIONS_FILE, ['id', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer'])
    if not questions_df.empty:
        # Clear existing questions in MongoDB to prevent duplicates
        db.questions.delete_many({})
        questions_data = questions_df.to_dict(orient='records')
        
        # MongoDB uses _id by default, remove existing 'id' field if it conflicts or just let MongoDB create _id
        # For questions, we will keep the 'id' field for consistency or let MongoDB create '_id'
        # For simplicity, let's remove the 'id' field and let MongoDB generate '_id'
        # Or, if 'id' is important, we can convert it to '_id' if it's unique enough (e.g., if it was UUID)
        # Here, let's ensure unique integer IDs are preserved if they don't conflict,
        # otherwise let MongoDB generate _id and rename the original 'id' to 'question_id_csv'
        
        # For now, let's just insert and let MongoDB generate _id, and assume 'id' column from CSV is just data
        for q in questions_data:
            # Ensure 'id' from CSV is an integer if it's meant to be so
            if 'id' in q:
                q['id'] = int(q['id'])
        
        db.questions.insert_many(questions_data)
        print(f"Migrated {len(questions_data)} questions.")
    else:
        print("No questions data found in CSV to migrate.")

def migrate_leaderboard():
    print(f"Migrating leaderboard from {LEADERBOARD_FILE}...")
    leaderboard_df = read_csv_safe(LEADERBOARD_FILE, ['username', 'score', 'date'])
    if not leaderboard_df.empty:
        # Clear existing leaderboard in MongoDB
        db.leaderboard.delete_many({})
        leaderboard_data = leaderboard_df.to_dict(orient='records')
        db.leaderboard.insert_many(leaderboard_data)
        print(f"Migrated {len(leaderboard_data)} leaderboard entries.")
    else:
        print("No leaderboard data found in CSV to migrate.")

if __name__ == "__main__":
    print("Starting data migration to MongoDB...")
    migrate_users()
    migrate_questions()
    migrate_leaderboard()
    print("Data migration completed.")
    client.close()
