from . import db


class Course(db.Model):
    __tablename__ = "courses"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    duration = db.Column(db.String(50))
    level = db.Column(db.String(50))  # UG / PG
    avg_fees = db.Column(db.Integer)
    scope = db.Column(db.Text)
    stream = db.Column(db.String(80))
    popular = db.Column(db.Boolean, default=False)
