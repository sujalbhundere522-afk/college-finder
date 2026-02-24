from . import db

class CompareCollege(db.Model):
    __tablename__ = "compare_colleges"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    college_id = db.Column(db.Integer, db.ForeignKey("colleges.id"))

    college = db.relationship(
        "College",
        back_populates="compared_by"
    )