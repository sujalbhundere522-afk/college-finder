from flask import Blueprint, jsonify, request
from utils.helpers import admin_required
from models.user import User
from models.college import College
from models.review import Review
from models.saved_college import SavedCollege
from models.compare_college import CompareCollege
from models import db
from sqlalchemy import func
import json
from flask_jwt_extended import get_jwt_identity

admin_bp = Blueprint("admin_bp", __name__, url_prefix="/api/admin")




# =========================
# ADMIN: CREATE COLLEGE
# =========================
@admin_bp.route("/colleges", methods=["POST"])
@admin_required()
def create_college():
    data = request.get_json()

    placement = data.get("placement", {})

    import json

    college = College(
    name=data.get("name"),
    city=data.get("city"),
    state=data.get("state"),
    fees=data.get("fees"),
    stream=data.get("stream"),
    
    about=data.get("about"),
    ranking=data.get("ranking"),
    cutoff=data.get("cutoff"),
    rating=data.get("rating"),
    placement_rate=data.get("placement_rate"),
    avg_package=data.get("avg_package"),
    highest_package=data.get("highest_package"),
    recruiters=json.dumps(data.get("recruiters", [])),
    facilities=json.dumps(data.get("facilities", [])),
    courses=json.dumps(data.get("courses", [])),
    phone=data.get("phone"),
    email=data.get("email"),
    website=data.get("website"),
    address=data.get("address"),
    image_url=data.get("image_url")
)



    db.session.add(college)
    db.session.commit()

    return jsonify({
        "message": "College created successfully",
        "data": college.to_dict()
    }), 201






# =========================
# ADMIN: GET ALL COLLEGES
# =========================
# =========================
# ADMIN: GET ALL COLLEGES (WITH SEARCH)
# =========================
@admin_bp.route("/colleges", methods=["GET"])
@admin_required()
def get_all_colleges():

    query = request.args.get("q", "").strip()

    colleges_query = College.query

    # 🔎 Apply search filter if query exists
    if query:
        colleges_query = colleges_query.filter(
            College.name.ilike(f"%{query}%")
        )

    colleges = colleges_query.order_by(College.id.desc()).all()

    return jsonify({
        "data": [c.to_dict() for c in colleges]
    })



# =========================
# ADMIN: UPDATE COLLEGE
# =========================
@admin_bp.route("/colleges/<int:id>", methods=["PUT"])
@admin_required()
def update_college(id):
    college = College.query.get(id)

    if not college:
        return jsonify({"error": "College not found"}), 404

    data = request.get_json()

    college.name = data.get("name", college.name)
    college.city = data.get("city", college.city)
    college.state = data.get("state", college.state)
    college.stream = data.get("stream", college.stream)
    college.fees = data.get("fees", college.fees)
    college.ranking = data.get("ranking", college.ranking)
    college.cutoff = data.get("cutoff", college.cutoff)
    college.placement_rate = data.get("placement_rate", college.placement_rate)
    college.avg_package = data.get("avg_package", college.avg_package)
    college.highest_package = data.get("highest_package", college.highest_package)
    college.image_url = data.get("image_url", college.image_url)

    db.session.commit()

    return jsonify({
        "message": "College updated successfully",
        "data": college.to_dict()
    }), 200





# =========================
# ADMIN: DELETE COLLEGE
# =========================
@admin_bp.route("/colleges/<int:id>", methods=["DELETE"])
@admin_required()
def delete_college(id):
    college = College.query.get(id)

    if not college:
        return jsonify({"error": "College not found"}), 404

    db.session.delete(college)
    db.session.commit()

    return jsonify({"message": "College deleted successfully"})



# =========================
# ADMIN: GET ALL USERS
# =========================
@admin_bp.route("/users", methods=["GET"])
@admin_required()
def get_all_users():
    users = User.query.all()

    return jsonify({
        "data": [u.to_dict() for u in users]
    })


# =========================
# ADMIN: UPDATE USER ROLE
# =========================


@admin_bp.route("/users/<int:user_id>/role", methods=["PUT"])
@admin_required()
def update_user_role(user_id):

    current_user_id = int(get_jwt_identity())


    # ❌ Prevent changing your own role
    if current_user_id == user_id:
        return jsonify({"error": "You cannot change your own role"}), 400

    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    new_role = data.get("role")

    if new_role not in ["admin", "user"]:
        return jsonify({"error": "Invalid role"}), 400

    # ❌ Prevent removing last admin
    if user.role == "admin" and new_role == "user":
        admin_count = User.query.filter_by(role="admin").count()
        if admin_count <= 1:
            return jsonify({"error": "Cannot remove role from the last admin"}), 400

    user.role = new_role
    db.session.commit()

    return jsonify({"message": "Role updated successfully"})



# =========================
# ADMIN: DELETE USER
# =========================


@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@admin_required()
def delete_user(user_id):

    current_user_id = int(get_jwt_identity())


    # ❌ Prevent deleting yourself
    if current_user_id == user_id:
        return jsonify({"error": "You cannot delete your own account"}), 400

    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    # ❌ Prevent deleting last admin
    if user.role == "admin":
        admin_count = User.query.filter_by(role="admin").count()
        if admin_count <= 1:
            return jsonify({"error": "Cannot delete the last admin"}), 400

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User deleted successfully"})



@admin_bp.route("/dashboard", methods=["GET"])
@admin_required()
def admin_dashboard():

    # 🔹 Total counts
    total_colleges = College.query.count()
    total_users = User.query.count()
    total_reviews = Review.query.count()
    total_saved = SavedCollege.query.count()
    total_compared = CompareCollege.query.count()

    # 🔹 Top Rated
    top_rated = (
        db.session.query(
            College.id,
            College.name,
            func.avg(Review.rating).label("avg_rating")
        )
        .join(Review, Review.college_id == College.id)
        .group_by(College.id)
        .order_by(func.avg(Review.rating).desc())
        .limit(5)
        .all()
    )

    top_rated_list = [
        {
            "id": c.id,
            "name": c.name,
            "rating": round(c.avg_rating, 2)
        }
        for c in top_rated
    ]

    # 🔹 Most Saved
    most_saved = (
        db.session.query(
            College.id,
            College.name,
            College.city,
            func.count(SavedCollege.id).label("save_count")
        )
        .join(SavedCollege, SavedCollege.college_id == College.id)
        .group_by(College.id)
        .order_by(func.count(SavedCollege.id).desc())
        .first()
    )

    most_saved_data = None

    if most_saved:
        most_saved_data = {
            "id": most_saved.id,
            "name": most_saved.name,
            "city": most_saved.city,
            "save_count": most_saved.save_count
        }

    # 🔹 Colleges by Stream
    stream_data = (
        db.session.query(
            College.stream,
            func.count(College.id).label("count")
        )
        .group_by(College.stream)
        .all()
    )

    stream_chart = [
        {"stream": s.stream, "count": s.count}
        for s in stream_data
    ]

    # 🔹 Colleges by City
    city_data = (
        db.session.query(
            College.city,
            func.count(College.id).label("count")
        )
        .group_by(College.city)
        .all()
    )

    city_chart = [
        {"city": c.city, "count": c.count}
        for c in city_data
    ]

    # 🔹 Reviews per College
    review_data = (
        db.session.query(
            College.name,
            func.count(Review.id).label("review_count")
        )
        .join(Review, Review.college_id == College.id)
        .group_by(College.name)
        .all()
    )

    review_chart = [
        {"college": r.name, "reviews": r.review_count}
        for r in review_data
    ]


    # 🔹 Highest Placement College
    highest_placement = (
    College.query
    .order_by(College.placement_rate.desc())
    .first()
)

    highest_placement_data = None

    if highest_placement:
        highest_placement_data = {
        "id": highest_placement.id,
        "name": highest_placement.name,
        "city": highest_placement.city,
        "placement_rate": highest_placement.placement_rate,
        "avg_package": highest_placement.avg_package,
        "highest_package": highest_placement.highest_package
    }
        
    # 🔹 Users by Role (Admin vs User)
        # 🔹 Users by Role (Admin vs User)
    user_role_data = (
        db.session.query(
            User.role,
            func.count(User.id).label("count")
        )
        .group_by(User.role)
        .all()
    )

    user_chart = [
        {"role": u.role, "count": u.count}
        for u in user_role_data
    ]

    


    return jsonify({
        "totals": {
            "colleges": total_colleges,
            "users": total_users,
            "reviews": total_reviews,
            "saved": total_saved,
            "compared": total_compared
        },
        "top_rated": top_rated_list,
        "most_saved": most_saved_data,
        "highest_placement": highest_placement_data,

        "charts": {
    "stream": stream_chart,
    "city": city_chart,
    "reviews": review_chart,
    "users": user_chart
}

    })



