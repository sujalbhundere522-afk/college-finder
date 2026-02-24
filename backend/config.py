import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = "collegefinder-super-secure-secret-key-2026-strong-key"
    JWT_SECRET_KEY = "collegefinder-super-secure-secret-key-2026-strong-key"

    SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")

    SQLALCHEMY_TRACK_MODIFICATIONS = False
