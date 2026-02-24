from . import db

class SavedCollege(db.Model):
    __tablename__ = "saved_colleges"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    college_id = db.Column(db.Integer, db.ForeignKey("colleges.id"))

    college = db.relationship(
    "College",
    back_populates="saved_by"
)

