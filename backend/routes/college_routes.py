from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db

from models.college import College
from models.saved_college import SavedCollege
from models.review import Review
from models.compare_college import CompareCollege

college_bp = Blueprint("college_bp", __name__)


def update_college_rating(college_id):
    reviews = Review.query.filter_by(college_id=college_id).all()

    if not reviews:
        return

    avg_rating = sum(r.rating for r in reviews) / len(reviews)

    college = College.query.get(college_id)
    college.rating = round(avg_rating, 1)

    db.session.commit()


# -------------------------------------------------
# LIST / SEARCH / FILTER
# -------------------------------------------------
@college_bp.route("/api/colleges", methods=["GET"])
def get_colleges():

    q = request.args.get("q", "").strip()
    stream = request.args.get("stream", "").strip()
    city = request.args.get("city", "").strip()
    max_fees = request.args.get("maxFees", type=int)
    min_cutoff = request.args.get("minCutoff", type=int)

    sort = request.args.get("sort", "")

    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 6, type=int)

    query = College.query

    if q:
        query = query.filter(College.name.ilike(f"%{q}%"))

    if stream:
        query = query.filter(College.stream.ilike(f"%{stream}%"))

    if city:
        query = query.filter(College.city.ilike(f"%{city}%"))

    if max_fees is not None:
        query = query.filter(College.fees <= max_fees)

    if min_cutoff is not None:
        query = query.filter(College.cutoff >= min_cutoff)


    if sort == "fees_asc":
        query = query.order_by(College.fees.asc())
    elif sort == "fees_desc":
        query = query.order_by(College.fees.desc())
    elif sort == "ranking_asc":
        query = query.order_by(College.ranking.asc())

    total = query.count()
    colleges = query.offset((page - 1) * limit).limit(limit).all()

    return jsonify({
        "data": [c.to_dict() for c in colleges],
        "page": page,
        "totalPages": (total + limit - 1) // limit
    })


# -------------------------------------------------
# COLLEGE DETAILS
# -------------------------------------------------
@college_bp.route("/api/colleges/<int:college_id>", methods=["GET"])
def get_college_by_id(college_id):

    college = College.query.get(college_id)

    if not college:
        return jsonify({"error": "College not found"}), 404

    return jsonify(college.to_dict())


# -------------------------------------------------
# SAVED COLLEGES
# -------------------------------------------------


@college_bp.route("/api/users/saved", methods=["GET"])
@jwt_required()
def get_saved_colleges():

    user_id = get_jwt_identity()

    saved = SavedCollege.query.filter_by(user_id=user_id).all()
    colleges = [s.college.to_dict() for s in saved]

    return jsonify(colleges)



@college_bp.route("/api/users/saved", methods=["POST"])
@jwt_required()

def save_college():

    user_id = get_jwt_identity()

    data = request.get_json()
    college_id = data.get("college_id")

    existing = SavedCollege.query.filter_by(
        user_id=user_id,
        college_id=college_id
    ).first()

    if existing:
        return jsonify({"message": "Already saved"})

    new_save = SavedCollege(
        user_id=user_id,
        college_id=college_id
    )

    db.session.add(new_save)
    db.session.commit()

    return jsonify({"message": "College saved"})


@college_bp.route("/api/users/saved/<int:college_id>", methods=["DELETE"])
@jwt_required()

def remove_saved_college(college_id):

    user_id = get_jwt_identity()


    saved = SavedCollege.query.filter_by(
        user_id=user_id,
        college_id=college_id
    ).first()

    if not saved:
        return jsonify({"error": "Not found"}), 404

    db.session.delete(saved)
    db.session.commit()

    return jsonify({"message": "College removed"})


# -------------------------------------------------
# COMPARE COLLEGES
# -------------------------------------------------
@college_bp.route("/api/users/compare", methods=["GET"])
@jwt_required()

def get_compare_colleges():

    user_id = get_jwt_identity()


    compared = CompareCollege.query.filter_by(user_id=user_id).all()

    colleges = [
        College.query.get(c.college_id).to_dict()
        for c in compared
    ]

    return jsonify(colleges)


@college_bp.route("/api/users/compare", methods=["POST"])
@jwt_required()

def add_compare_college():

    user_id = get_jwt_identity()

    data = request.get_json()
    college_id = data.get("college_id")

    existing = CompareCollege.query.filter_by(
        user_id=user_id,
        college_id=college_id
    ).first()

    if existing:
        return jsonify({"message": "Already added"})

    new_compare = CompareCollege(
        user_id=user_id,
        college_id=college_id
    )

    db.session.add(new_compare)
    db.session.commit()

    return jsonify({"message": "Added to compare"})


@college_bp.route("/api/users/compare/<int:college_id>", methods=["DELETE"])
@jwt_required()

def remove_compare_college(college_id):

    user_id = get_jwt_identity()


    compare = CompareCollege.query.filter_by(
        user_id=user_id,
        college_id=college_id
    ).first()

    if not compare:
        return jsonify({"error": "Not found"}), 404

    db.session.delete(compare)
    db.session.commit()

    return jsonify({"message": "Removed from compare"})


# -------------------------------------------------
# REVIEWS
# -------------------------------------------------
@college_bp.route("/api/colleges/<int:college_id>/reviews", methods=["GET"])
def get_college_reviews(college_id):

    reviews = Review.query.filter_by(college_id=college_id).all()
    return jsonify([r.to_dict() for r in reviews])


@college_bp.route("/api/colleges/<int:college_id>/reviews", methods=["POST"])
@jwt_required()

def add_college_review(college_id):

    user_id = get_jwt_identity()

    data = request.get_json()

    existing = Review.query.filter_by(
        user_id=user_id,
        college_id=college_id
    ).first()

    if existing:
        return jsonify({"error": "Already reviewed"}), 409

    review = Review(
        user_id=user_id,
        college_id=college_id,
        rating=data["rating"],
        comment=data["comment"]
    )

    db.session.add(review)
    db.session.commit()
    update_college_rating(college_id)


    return jsonify({"message": "Review added"})


# -------------------------------------------------
# REVIEW COUNT
# -------------------------------------------------
@college_bp.route("/api/users/reviews/count", methods=["GET"])
@jwt_required()

def get_user_review_count():

    user_id = get_jwt_identity()

    count = Review.query.filter_by(user_id=user_id).count()

    return jsonify({"count": count})


# -------------------------------------------------
# EDIT REVIEW
# -------------------------------------------------
@college_bp.route("/api/colleges/<int:college_id>/reviews", methods=["PUT"])
@jwt_required()

def edit_review(college_id):

    user_id = get_jwt_identity()


    review = Review.query.filter_by(
        user_id=user_id,
        college_id=college_id
    ).first()

    if not review:
        return jsonify({"error": "Review not found"}), 404

    data = request.get_json()

    review.rating = data.get("rating", review.rating)
    review.comment = data.get("comment", review.comment)

    db.session.commit()
    update_college_rating(college_id)

    return jsonify({"message": "Review updated"})


# -------------------------------------------------
# DELETE REVIEW
# -------------------------------------------------
@college_bp.route("/api/colleges/<int:college_id>/reviews", methods=["DELETE"])
@jwt_required()

def delete_review(college_id):

    user_id = get_jwt_identity()


    review = Review.query.filter_by(
        user_id=user_id,
        college_id=college_id
    ).first()

    if not review:
        return jsonify({"error": "Review not found"}), 404

    db.session.delete(review)
    db.session.commit()
    update_college_rating(college_id)


    return jsonify({"message": "Review deleted"})


# -------------------------------------------------
# USER REVIEWS
# -------------------------------------------------
@college_bp.route("/api/users/reviews", methods=["GET"])
@jwt_required()

def get_user_reviews():

    user_id = get_jwt_identity()


    reviews = Review.query.filter_by(user_id=user_id).all()
    result = []

    for r in reviews:
        college = College.query.get(r.college_id)
        result.append({
            "college_id": r.college_id,
            "college_name": college.name if college else "Unknown",
            "rating": r.rating,
            "comment": r.comment
        })

    return jsonify(result)
