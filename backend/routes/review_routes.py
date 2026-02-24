from flask import Blueprint, request, jsonify
from models import db
from models.review import Review
from models.college import College
from sqlalchemy import func
from flask_jwt_extended import jwt_required, get_jwt_identity

review_bp = Blueprint("review_bp", __name__, url_prefix="/api/colleges")


# =========================
# Helper: Update College Rating
# =========================
def update_college_rating(college_id):
    avg_rating = db.session.query(func.avg(Review.rating)) \
        .filter(Review.college_id == college_id) \
        .scalar()

    college = College.query.get(college_id)

    if college:
        if avg_rating:
            college.rating = round(avg_rating, 2)
        else:
            college.rating = 0

        db.session.commit()
@review_bp.route("/<int:college_id>/reviews", methods=["POST"])
@jwt_required()
def create_review(college_id):
    data = request.get_json()
    user_id = get_jwt_identity()

    review = Review(
        college_id=college_id,
        user_id=user_id,
        rating=data.get("rating"),
        comment=data.get("comment")
    )

    db.session.add(review)
    db.session.commit()

    update_college_rating(college_id)

    return jsonify({"message": "Review added"}), 201


@review_bp.route("/<int:college_id>/reviews", methods=["PUT"])
@jwt_required()
def update_review(college_id):
    review = Review.query.filter_by(
        college_id=college_id,
        user_id = get_jwt_identity()
    ).first()

    if not review:
        return jsonify({"error": "Review not found"}), 404

    data = request.get_json()
    review.rating = data.get("rating", review.rating)
    review.comment = data.get("comment", review.comment)

    db.session.commit()

    # 🔥 IMPORTANT
    update_college_rating(college_id)

    return jsonify({"message": "Review updated"})
@review_bp.route("/<int:college_id>/reviews", methods=["DELETE"])
@jwt_required()
def delete_review(college_id):
    user_id = get_jwt_identity()

    review = Review.query.filter_by(
        college_id=college_id,
        user_id=user_id
    ).first()

    if not review:
        return jsonify({"error": "Review not found"}), 404

    db.session.delete(review)
    db.session.commit()

    update_college_rating(college_id)

    return jsonify({"message": "Review deleted"})
