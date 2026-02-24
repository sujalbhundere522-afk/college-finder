from . import db
import json
from models.review import Review
       

class College(db.Model):
    __tablename__ = "colleges"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(200), nullable=False, index=True)
    city = db.Column(db.String(100), index=True)
    state = db.Column(db.String(100))

    fees = db.Column(db.Integer, nullable=False, default=0)
    stream = db.Column(db.String(100), index=True)

    cutoff = db.Column(db.Integer, default=0)
    ranking = db.Column(db.Integer, index=True, default=0)

    rating = db.Column(db.Float, default=0)


    # 🔥 Placement
    placement_rate = db.Column(db.Integer, default=0)
    avg_package = db.Column(db.Integer, default=0)
    highest_package = db.Column(db.Integer, default=0)

    recruiters = db.Column(db.Text)

    # 🔥 Facilities
    facilities = db.Column(db.Text)

    # 🔥 About & Courses
    about = db.Column(db.Text)
    courses = db.Column(db.Text)

    # 🔥 Contact
    phone = db.Column(db.String(50))
    email = db.Column(db.String(150))
    address = db.Column(db.Text)
    website = db.Column(db.String(300))

    image_url = db.Column(db.String(500))

    # Relationships
    reviews = db.relationship("Review", backref="college", cascade="all, delete")

    saved_by = db.relationship(
    "SavedCollege",
    back_populates="college",
    cascade="all, delete"
)

    compared_by = db.relationship(
    "CompareCollege",
    back_populates="college",
    cascade="all, delete"
)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "city": self.city,
            "state": self.state,
            "stream": self.stream,
            "fees": self.fees,
            "cutoff": self.cutoff,
            "ranking": self.ranking,
            "rating": round(self.rating, 1) if self.rating else 0,
            


            # 🔥 Frontend expects this name
            "short_desc": self.about,
            "image": self.image_url,

            # 🔥 Placement structure (frontend compatible)
            "placement": {
                "percentage": self.placement_rate,
                "avgPackage": self.avg_package,
                "highest": self.highest_package,
                "recruiters": self.recruiters.split(",") if self.recruiters else []
            },

            # 🔥 Facilities list
            "facilities": self.facilities.split(",") if self.facilities else [],

            # 🔥 Courses list (stored as JSON string)
            "courses": json.loads(self.courses) if self.courses else [],

            # 🔥 Contact structure
            "contact": {
                "phone": self.phone,
                "email": self.email,
                "address": self.address,
                "website": self.website
            }
        }
    

    def update_rating(self):

        reviews = Review.query.filter_by(college_id=self.id).all()

        if not reviews:
            self.rating = 0
        else:
            total = sum(r.rating for r in reviews)
            self.rating = round(total / len(reviews), 1)

        db.session.commit()
