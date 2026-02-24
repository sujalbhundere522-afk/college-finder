from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User
from .college import College
from .review import Review
from .saved_college import SavedCollege
from .compare_college import CompareCollege
from .course import Course

