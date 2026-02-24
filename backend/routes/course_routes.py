from flask import Blueprint, jsonify
from models import Course
from models import db, Course

course_bp = Blueprint("courses", __name__, url_prefix="/api/courses")

@course_bp.route("/seed")
def seed_courses():
    # 🔥 Step 1: Delete existing courses
    Course.query.delete()
    db.session.commit()
    courses = [

    # ================= ENGINEERING =================
    Course(
        name="Computer Science Engineering",
        duration="4 Years",
        level="UG",
        avg_fees=250000,
        scope="Software development, AI, cybersecurity, data science.",
        stream="Engineering",
        popular=True
    ),
    Course(
        name="B.Tech Information Technology",
        duration="4 Years",
        level="UG",
        avg_fees=230000,
        scope="IT industry, cloud computing, networking.",
        stream="Engineering",
        popular=True
    ),
    Course(
        name="B.Tech Electronics & Communication",
        duration="4 Years",
        level="UG",
        avg_fees=210000,
        scope="Telecom, embedded systems, electronics sector.",
        stream="Engineering",
        popular=False
    ),
    Course(
        name="B.Tech Mechanical Engineering",
        duration="4 Years",
        level="UG",
        avg_fees=220000,
        scope="Manufacturing, automobile, core engineering jobs.",
        stream="Engineering",
        popular=False
    ),
    Course(
        name="B.Tech Civil Engineering",
        duration="4 Years",
        level="UG",
        avg_fees=200000,
        scope="Construction, infrastructure, government projects.",
        stream="Engineering",
        popular=False
    ),
    Course(
        name="B.Tech Artificial Intelligence",
        duration="4 Years",
        level="UG",
        avg_fees=260000,
        scope="AI engineer, ML specialist, robotics.",
        stream="Engineering",
        popular=True
    ),
    Course(
        name="B.Tech Data Science",
        duration="4 Years",
        level="UG",
        avg_fees=250000,
        scope="Data analyst, big data engineer.",
        stream="Engineering",
        popular=True
    ),
    Course(
    name="B.Tech Electrical Engineering",
    duration="4 Years",
    level="UG",
    avg_fees=210000,
    scope="Power plants, electrical systems, government jobs.",
    stream="Engineering",
    popular=False
),
Course(
    name="B.Tech Chemical Engineering",
    duration="4 Years",
    level="UG",
    avg_fees=220000,
    scope="Chemical plants, petroleum industry.",
    stream="Engineering",
    popular=False
),
Course(
    name="B.Tech Aerospace Engineering",
    duration="4 Years",
    level="UG",
    avg_fees=300000,
    scope="Aviation industry, ISRO, DRDO.",
    stream="Engineering",
    popular=False
),
Course(
    name="B.Tech Robotics Engineering",
    duration="4 Years",
    level="UG",
    avg_fees=280000,
    scope="Robotics, automation industry.",
    stream="Engineering",
    popular=True
),
Course(
    name="B.Tech Cyber Security",
    duration="4 Years",
    level="UG",
    avg_fees=260000,
    scope="Ethical hacking, cybersecurity analyst.",
    stream="Engineering",
    popular=True
),


    # ================= SCIENCE =================
    Course(
        name="B.Sc Computer Science",
        duration="3 Years",
        level="UG",
        avg_fees=120000,
        scope="Software, IT jobs, MCA pathway.",
        stream="Science",
        popular=True
    ),
    Course(
        name="B.Sc IT",
        duration="3 Years",
        level="UG",
        avg_fees=120000,
        scope="IT services, networking, software testing.",
        stream="Science",
        popular=False
    ),
    Course(
        name="B.Sc Biotechnology",
        duration="3 Years",
        level="UG",
        avg_fees=180000,
        scope="Biotech firms, research labs.",
        stream="Science",
        popular=False
    ),
    Course(
        name="B.Sc Microbiology",
        duration="3 Years",
        level="UG",
        avg_fees=150000,
        scope="Pharma companies, laboratories.",
        stream="Science",
        popular=False
    ),
    Course(
        name="BCA",
        duration="3 Years",
        level="UG",
        avg_fees=140000,
        scope="Software developer, IT sector.",
        stream="Science",
        popular=True
    ),
    Course(
    name="B.Sc Data Science",
    duration="3 Years",
    level="UG",
    avg_fees=160000,
    scope="Data analyst, AI roles.",
    stream="Science",
    popular=True
),
Course(
    name="B.Sc Forensic Science",
    duration="3 Years",
    level="UG",
    avg_fees=150000,
    scope="Crime labs, forensic departments.",
    stream="Science",
    popular=False
),
Course(
    name="B.Sc Physics",
    duration="3 Years",
    level="UG",
    avg_fees=90000,
    scope="Research, teaching, higher studies.",
    stream="Science",
    popular=False
),
Course(
    name="B.Sc Chemistry",
    duration="3 Years",
    level="UG",
    avg_fees=90000,
    scope="Chemical labs, pharma companies.",
    stream="Science",
    popular=False
),
Course(
    name="B.Sc Mathematics",
    duration="3 Years",
    level="UG",
    avg_fees=80000,
    scope="Data analysis, actuarial science.",
    stream="Science",
    popular=False
),


    # ================= COMMERCE =================
    Course(
        name="B.Com",
        duration="3 Years",
        level="UG",
        avg_fees=130000,
        scope="Accounting, banking, finance sector.",
        stream="Commerce",
        popular=True
    ),
    Course(
        name="BMS",
        duration="3 Years",
        level="UG",
        avg_fees=140000,
        scope="Management roles, MBA pathway.",
        stream="Commerce",
        popular=True
    ),
    Course(
        name="BBA",
        duration="3 Years",
        level="UG",
        avg_fees=150000,
        scope="Business management, corporate sector.",
        stream="Commerce",
        popular=True
    ),
    Course(
        name="B.Com Accounting & Finance",
        duration="3 Years",
        level="UG",
        avg_fees=135000,
        scope="CA, financial analyst, banking.",
        stream="Commerce",
        popular=False
    ),
    Course(
        name="BBA Marketing",
        duration="3 Years",
        level="UG",
        avg_fees=150000,
        scope="Marketing, advertising, sales roles.",
        stream="Commerce",
        popular=False
    ),
    Course(
    name="Bachelor of Economics",
    duration="3 Years",
    level="UG",
    avg_fees=120000,
    scope="Banking, financial analyst.",
    stream="Commerce",
    popular=False
),
Course(
    name="B.Com Banking & Insurance",
    duration="3 Years",
    level="UG",
    avg_fees=140000,
    scope="Bank jobs, insurance sector.",
    stream="Commerce",
    popular=False
),
Course(
    name="BBA International Business",
    duration="3 Years",
    level="UG",
    avg_fees=170000,
    scope="Global trade, multinational companies.",
    stream="Commerce",
    popular=False
),


    # ================= MEDICAL =================
    Course(
        name="MBBS",
        duration="5.5 Years",
        level="UG",
        avg_fees=800000,
        scope="Doctor, medical practice, specialization.",
        stream="Medical",
        popular=True
    ),
    Course(
        name="BDS",
        duration="5 Years",
        level="UG",
        avg_fees=600000,
        scope="Dentist, dental clinics.",
        stream="Medical",
        popular=False
    ),
    Course(
        name="BAMS",
        duration="5.5 Years",
        level="UG",
        avg_fees=400000,
        scope="Ayurvedic doctor.",
        stream="Medical",
        popular=False
    ),
    Course(
        name="BHMS",
        duration="5.5 Years",
        level="UG",
        avg_fees=350000,
        scope="Homeopathy doctor.",
        stream="Medical",
        popular=False
    ),
    Course(
        name="BPT (Physiotherapy)",
        duration="4 Years",
        level="UG",
        avg_fees=250000,
        scope="Physiotherapist, rehabilitation specialist.",
        stream="Medical",
        popular=True
    ),
    Course(
        name="B.Sc Nursing",
        duration="4 Years",
        level="UG",
        avg_fees=200000,
        scope="Hospital nurse, healthcare sector.",
        stream="Medical",
        popular=True
    ),
    Course(
    name="B.Sc Radiology",
    duration="3 Years",
    level="UG",
    avg_fees=200000,
    scope="Radiology technician, hospitals.",
    stream="Medical",
    popular=False
),
Course(
    name="B.Sc Medical Laboratory Technology",
    duration="3 Years",
    level="UG",
    avg_fees=180000,
    scope="Lab technician, diagnostics labs.",
    stream="Medical",
    popular=False
),
Course(
    name="B.Optom (Optometry)",
    duration="4 Years",
    level="UG",
    avg_fees=220000,
    scope="Eye specialist, clinics.",
    stream="Medical",
    popular=False
),


    # ================= LAW =================
    Course(
        name="BA LLB",
        duration="5 Years",
        level="UG",
        avg_fees=180000,
        scope="Advocate, legal advisor.",
        stream="Law",
        popular=True
    ),
    Course(
        name="LLB",
        duration="3 Years",
        level="UG",
        avg_fees=170000,
        scope="Litigation, corporate law.",
        stream="Law",
        popular=False
    ),
    Course(
    name="BA Psychology",
    duration="3 Years",
    level="UG",
    avg_fees=100000,
    scope="Counseling, HR, clinical psychology (with PG).",
    stream="Arts",
    popular=True
),
Course(
    name="BA Journalism & Mass Communication",
    duration="3 Years",
    level="UG",
    avg_fees=150000,
    scope="Media, news, content creation.",
    stream="Arts",
    popular=True
),
Course(
    name="BA English",
    duration="3 Years",
    level="UG",
    avg_fees=90000,
    scope="Teaching, writing, civil services.",
    stream="Arts",
    popular=False
),
Course(
    name="BA Political Science",
    duration="3 Years",
    level="UG",
    avg_fees=90000,
    scope="UPSC, government jobs.",
    stream="Arts",
    popular=False
),


    # ================= DESIGN =================
    Course(
        name="B.Des Graphic Design",
        duration="4 Years",
        level="UG",
        avg_fees=240000,
        scope="Brand design, UI/UX design.",
        stream="Design",
        popular=True
    ),
    Course(
        name="B.Des Animation",
        duration="4 Years",
        level="UG",
        avg_fees=260000,
        scope="Animation studios, gaming industry.",
        stream="Design",
        popular=False
    ),
    Course(
    name="BHM (Hotel Management)",
    duration="4 Years",
    level="UG",
    avg_fees=300000,
    scope="Hotel industry, hospitality sector.",
    stream="Management",
    popular=True
),
Course(
    name="BBA Aviation",
    duration="3 Years",
    level="UG",
    avg_fees=250000,
    scope="Airline management, airport operations.",
    stream="Management",
    popular=False
),


    # ================= PHARMACY =================
    Course(
        name="B.Pharm",
        duration="4 Years",
        level="UG",
        avg_fees=220000,
        scope="Pharmaceutical industry, drug research.",
        stream="Pharmacy",
        popular=True
    ),
]

# 🔥 Step 3: Insert Fresh Courses
    db.session.bulk_save_objects(courses)
    db.session.commit()

    return jsonify({"message": "Courses reset and seeded successfully"})


@course_bp.route("/")
def get_courses():
    courses = Course.query.all()

    result = []
    for c in courses:
        result.append({
            "id": c.id,
            "name": c.name,
            "duration": c.duration,
            "level": c.level,
            "avg_fees": c.avg_fees,
            "scope": c.scope,
            "stream": c.stream,
            "popular": c.popular
        })

    return jsonify(result)
