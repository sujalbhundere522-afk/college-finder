from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token

from models.user import User
from models import db

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/api/auth")


# =====================================
# REGISTER (DATABASE VERSION)
# =====================================
from models.user import User
from models import db

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "All fields required"}), 400

    existing = User.query.filter_by(email=email).first()
    if existing:
        return jsonify({"error": "Email already registered"}), 409

    # 🔥 If no users exist → make first user admin
    role = "admin" if User.query.count() == 0 else "user"

    new_user = User(
        name=name,
        email=email,
        role=role
    )

    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully",
        "role": role
    }), 201


# =====================================
# LOGIN (DATABASE VERSION)
# =====================================
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Missing credentials"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    # ✅ CREATE TOKEN USING flask_jwt_extended
    access_token = create_access_token(
    identity=str(user.id),   # ✅ convert to string
    additional_claims={
        "role": user.role,
        "email": user.email
    }
)


    return jsonify({
        "token": access_token,
        "user": user.to_dict()
    })

