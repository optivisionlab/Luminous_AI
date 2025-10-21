import pandas as pd
import os
from datetime import datetime

USERS_FILE = 'users.csv'
QUESTIONS_FILE = 'questions.csv'
LEADERBOARD_FILE = 'leaderboard.csv'

def read_users():
    if os.path.exists(USERS_FILE):
        return pd.read_csv(USERS_FILE)
    return pd.DataFrame(columns=['username', 'password'])

def write_users(df):
    df.to_csv(USERS_FILE, index=False)

def read_questions():
    if os.path.exists(QUESTIONS_FILE):
        return pd.read_csv(QUESTIONS_FILE)
    return pd.DataFrame(columns=['id', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer'])

def write_questions(df):
    df.to_csv(QUESTIONS_FILE, index=False)

def read_leaderboard():
    if os.path.exists(LEADERBOARD_FILE):
        return pd.read_csv(LEADERBOARD_FILE)
    return pd.DataFrame(columns=['username', 'score', 'date'])

def write_leaderboard(df):
    df.to_csv(LEADERBOARD_FILE, index=False)
