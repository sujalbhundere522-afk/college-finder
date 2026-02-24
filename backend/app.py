from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from models import db

from routes.college_routes import college_bp
from routes.auth_routes import auth_bp
from routes.admin_routes import admin_bp
from flask_jwt_extended import JWTManager

from routes.course_routes import course_bp
from routes.user_routes import user_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # 🔥 init extensions
    db.init_app(app)
    CORS(app)

    # Config
    app.config["JWT_SECRET_KEY"] = "this-is-a-very-long-super-secure-jwt-secret-key-2026"
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]
    app.config["JWT_HEADER_NAME"] = "Authorization"
    app.config["JWT_HEADER_TYPE"] = "Bearer"

    jwt = JWTManager(app)

    #    Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(college_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(course_bp)
    app.register_blueprint(user_bp)




    # 🔥 create tables
    with app.app_context():
        db.create_all()

    # 🔥 health check
    @app.route("/")
    def home():
        return jsonify({
            "status": "success",
            "message": "CollegeFinder Backend is running"
        })

    # 🔥 debug helper
    @app.route("/debug/routes")
    def routes():
        return jsonify([str(r) for r in app.url_map.iter_rules()])

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
