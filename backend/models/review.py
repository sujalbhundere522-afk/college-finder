from . import db

class Review(db.Model):
    __tablename__ = "reviews"

    __table_args__ = (
    db.UniqueConstraint("user_id", "college_id", name="unique_user_college_review"),
)

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    college_id = db.Column(db.Integer, db.ForeignKey("colleges.id"), nullable=False)

    rating = db.Column(db.Integer)
    comment = db.Column(db.Text)

    user = db.relationship("User", back_populates="reviews")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.user.name,
            "rating": self.rating,
            "comment": self.comment,
            "user_id": self.user_id
        }
