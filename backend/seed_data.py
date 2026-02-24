from app import create_app
from models import db
from models.user import User
from models.college import College
import json
import random

app = create_app()

# ===============================
# ROUND FEE GENERATOR
# ===============================

def get_stream_fee(stream):
    fee_ranges = {
        "Engineering": [150000, 200000, 250000, 300000, 350000, 400000],
        "Management": [200000, 300000, 400000, 500000, 600000],
        "Medical": [500000, 800000, 1000000, 1200000],
        "Science": [50000, 80000, 100000, 120000, 150000],
        "Commerce": [50000, 80000, 100000, 120000, 150000, 200000],
        "Law": [100000, 150000, 200000, 250000],
        "Design": [150000, 200000, 250000, 300000]
    }
    return random.choice(fee_ranges.get(stream, [150000]))

# ===============================
# PLACEMENT BY STREAM
# ===============================

def get_placement_data(stream):
    placement_ranges = {
        "Engineering": (10, 25, 60),
        "Management": (12, 30, 70),
        "Medical": (6, 15, 30),
        "Science": (4, 12, 25),
        "Commerce": (5, 15, 25),
        "Law": (6, 18, 35),
        "Design": (6, 18, 40)
    }

    avg_min, avg_max, high_max = placement_ranges.get(stream, (5, 15, 30))

    return {
        "placement_rate": random.choice([80, 85, 90, 95]),
        "avg_package": random.randint(avg_min, avg_max),
        "highest_package": random.randint(avg_max, high_max)
    }

# ===============================
# COURSE GENERATOR
# ===============================

def generate_courses(stream):
    base_courses = {
        "Engineering": [
            "Computer Science Engineering",
            "Mechanical Engineering",
            "Civil Engineering",
            "Electrical Engineering",
            "Electronics Engineering",
            "Artificial Intelligence",
            "Data Science",
            "Information Technology",
            "Chemical Engineering"
        ],
        "Medical": [
            "MBBS", "MD", "MS", "BDS",
            "B.Sc Nursing", "Physiotherapy",
            "Radiology", "Pharmacology"
        ],
        "Science": [
            "B.Sc Computer Science", "B.Sc Physics",
            "B.Sc Chemistry", "B.Sc Mathematics",
            "Biotechnology", "Microbiology",
            "Data Science", "Statistics"
        ],

        "Commerce": [
            "B.Com",
            "B.Com Accounting & Finance",
            "B.Com Banking & Insurance",
            "BBA",
            "Bachelor of Economics",
            "BMS",
            "B.Com Financial Markets"
        ],
        "Management": [
            "BBA", "MBA", "Finance", "Marketing",
            "HR", "Business Analytics",
            "International Business", "Operations"
        ],
        "Law": [
            "BA LLB", "LLB", "LLM",
            "Corporate Law", "Criminal Law"
        ],
        "Design": [
            "Graphic Design", "Fashion Design",
            "UI/UX Design", "Animation",
            "Product Design"
        ]
    }

    return [
        {
            "name": name,
            "duration": "4 Years" if stream in ["Engineering", "Design"] else "3 Years",
            "level": "UG",
            "fees": get_stream_fee(stream)
        }
        for name in base_courses.get(stream, [])
    ]



def get_recruiters(stream):
    recruiters = {
        "Engineering": "TCS, Infosys, Google, Amazon, Microsoft, Accenture, Wipro",
        "Management": "Deloitte, EY, KPMG, PwC, HDFC Bank, ICICI Bank, McKinsey",
        "Medical": "Apollo Hospitals, Fortis, AIIMS Network, Max Healthcare, Cipla",
        "Science": "ISRO, DRDO, Biocon, Serum Institute, Research Labs",
        "Law": "AZB & Partners, Khaitan & Co, Trilegal, Supreme Court Chambers",
        "Design": "Tata Elxsi, Adobe, Flipkart Design, Myntra, Ogilvy",
        "Commerce": "Deloitte, EY, KPMG, PwC, Grant Thornton, HDFC Bank"
    }

    return recruiters.get(stream, "Top Recruiters")

def get_facilities(stream):
    facilities = {
        "Engineering": "Advanced Labs, Innovation Center, Robotics Lab, Library, Hostel, WiFi, Sports Complex",
        "Management": "Business Incubation Center, Seminar Halls, Corporate Training Labs, Library, Hostel",
        "Medical": "Teaching Hospital, Clinical Labs, Research Center, Library, Hostel",
        "Science": "Research Laboratories, Biotechnology Lab, Physics Lab, Library, Hostel",
        "Law": "Moot Court Hall, Legal Research Center, Library, Seminar Halls",
        "Design": "Design Studios, Animation Lab, Mac Lab, Creative Workshops, Library",
        "Commerce": "Financial Lab, Computer Lab, Seminar Hall, Library, Hostel"
    }

    return facilities.get(stream, "Library, Hostel")

def generate_about(name, stream, city):
    return (
    f"{name} located in {city} is one of the leading institutions in India offering excellence in {stream} education.\n\n"
    f"The institution is known for academic rigor, industry exposure, strong alumni network, and modern infrastructure.\n\n"
    f"It offers undergraduate and postgraduate programs with strong emphasis on research and innovation.\n\n"
    f"With excellent placement records and modern facilities, {name} attracts students from across the country.\n\n"
    f"The curriculum is industry-aligned and designed to meet global standards in {stream}."
)

# ===============================
# COLLEGES LIST (45+ REAL)
# ===============================

colleges_data = [

    # 🔝 TOP ENGINEERING
    ("IIT Bombay", "Mumbai", "Maharashtra", "Engineering", "https://www.iitb.ac.in"),
    ("IIT Delhi", "Delhi", "Delhi", "Engineering", "https://home.iitd.ac.in"),
    ("IIT Madras", "Chennai", "Tamil Nadu", "Engineering", "https://www.iitm.ac.in"),
    ("IIT Kanpur", "Kanpur", "Uttar Pradesh", "Engineering", "https://www.iitk.ac.in"),
    ("IIT Kharagpur", "Kharagpur", "West Bengal", "Engineering", "https://www.iitkgp.ac.in"),

    # Other Engineering
    ("BITS Pilani", "Pilani", "Rajasthan", "Engineering", "https://www.bits-pilani.ac.in"),
    ("VIT Vellore", "Vellore", "Tamil Nadu", "Engineering", "https://vit.ac.in"),
    ("SRM University", "Chennai", "Tamil Nadu", "Engineering", "https://www.srmist.edu.in"),
    ("Manipal Institute of Technology", "Manipal", "Karnataka", "Engineering", "https://manipal.edu/mit.html"),
    ("COEP Pune", "Pune", "Maharashtra", "Engineering", "https://www.coep.org.in"),
    ("Thapar University", "Patiala", "Punjab", "Engineering", "https://www.thapar.edu"),
    ("RV College of Engineering", "Bangalore", "Karnataka", "Engineering", "https://rvce.edu.in"),

    # 🔝 MEDICAL
    ("AIIMS Delhi", "Delhi", "Delhi", "Medical", "https://www.aiims.edu"),
    ("AIIMS Bhopal", "Bhopal", "Madhya Pradesh", "Medical", "https://www.aiimsbhopal.edu.in"),
    ("CMC Vellore", "Vellore", "Tamil Nadu", "Medical", "https://www.cmch-vellore.edu"),
    ("KEM Medical College", "Mumbai", "Maharashtra", "Medical", "https://www.kem.edu"),
    ("JIPMER", "Puducherry", "Puducherry", "Medical", "https://jipmer.edu.in"),
    ("Kasturba Medical College", "Manipal", "Karnataka", "Medical", "https://manipal.edu/kmc-manipal.html"),
    ("Maulana Azad Medical College", "Delhi", "Delhi", "Medical", "https://www.mamc.ac.in"),

    # 🔝 SCIENCE
    ("Fergusson College", "Pune", "Maharashtra", "Science", "https://www.fergusson.edu"),
    ("St. Xavier’s College", "Mumbai", "Maharashtra", "Science", "https://xaviers.edu"),
    ("Loyola College", "Chennai", "Tamil Nadu", "Science", "https://loyolacollege.edu"),
    ("Christ University", "Bangalore", "Karnataka", "Science", "https://christuniversity.in"),
    ("Presidency College", "Chennai", "Tamil Nadu", "Science", "https://www.presidencycollegechennai.ac.in"),
    ("Madras Christian College", "Chennai", "Tamil Nadu", "Science", "https://mcc.edu.in"),
    ("Hansraj College", "Delhi", "Delhi", "Science", "https://www.hansrajcollege.ac.in"),

    # ===============================
    # COMMERCE COLLEGES
    # ===============================

    ("Shri Ram College of Commerce (SRCC)", "Delhi", "Delhi", "Commerce", "https://www.srcc.edu"),
    ("Lady Shri Ram College (LSR)", "Delhi", "Delhi", "Commerce", "https://lsr.edu.in"),
    ("Hindu College", "Delhi", "Delhi", "Commerce", "https://www.hinducollege.ac.in"),
    ("Hansraj College", "Delhi", "Delhi", "Commerce", "https://www.hansrajcollege.ac.in"),
    ("St. Xavier’s College (Commerce)", "Mumbai", "Maharashtra", "Commerce", "https://xaviers.edu"),
    ("Narsee Monjee College of Commerce", "Mumbai", "Maharashtra", "Commerce", "https://nmcollege.in"),
    ("Christ University (Commerce)", "Bangalore", "Karnataka", "Commerce", "https://christuniversity.in"),
    ("Loyola College (Commerce)", "Chennai", "Tamil Nadu", "Commerce", "https://loyolacollege.edu"),
    ("Symbiosis College of Arts & Commerce", "Pune", "Maharashtra", "Commerce", "https://www.symbiosiscollege.edu.in"),
    ("Mount Carmel College", "Bangalore", "Karnataka", "Commerce", "https://mccblr.edu.in"),

    # MANAGEMENT
    ("IIM Ahmedabad", "Ahmedabad", "Gujarat", "Management", "https://www.iima.ac.in"),
    ("IIM Bangalore", "Bangalore", "Karnataka", "Management", "https://www.iimb.ac.in"),
    ("IIM Calcutta", "Kolkata", "West Bengal", "Management", "https://www.iimcal.ac.in"),
    ("NMIMS Mumbai", "Mumbai", "Maharashtra", "Management", "https://www.nmims.edu"),
    ("XLRI Jamshedpur", "Jamshedpur", "Jharkhand", "Management", "https://www.xlri.ac.in"),

    # LAW
    ("NLSIU Bangalore", "Bangalore", "Karnataka", "Law", "https://www.nls.ac.in"),
    ("NLU Delhi", "Delhi", "Delhi", "Law", "https://nludelhi.ac.in"),
    ("NALSAR University", "Hyderabad", "Telangana", "Law", "https://www.nalsar.ac.in"),
    ("GNLU", "Gandhinagar", "Gujarat", "Law", "https://www.gnlu.ac.in"),

    # DESIGN
    ("NID Ahmedabad", "Ahmedabad", "Gujarat", "Design", "https://www.nid.edu"),
    ("NIFT Delhi", "Delhi", "Delhi", "Design", "https://www.nift.ac.in/delhi"),
    ("MIT Institute of Design", "Pune", "Maharashtra", "Design", "https://mitid.edu.in"),
]

total_colleges = len(colleges_data)

# ===============================
# SMART RANKING SYSTEM
# ===============================

top_colleges = [
    "IIT Bombay", "IIT Delhi", "IIT Madras",
    "AIIMS Delhi", "IIM Ahmedabad", "IIM Bangalore"
]

rankings = {}
current_rank = 1

# Assign top ranks first
for college in colleges_data:
    if college[0] in top_colleges:
        rankings[college[0]] = current_rank
        current_rank += 1

# Assign remaining ranks
remaining = [c for c in colleges_data if c[0] not in rankings]
random.shuffle(remaining)

for college in remaining:
    rankings[college[0]] = current_rank
    current_rank += 1

with app.app_context():
    print("Seeding database...")

    
    db.create_all()

    admin = User(
        name="Admin User",
        email="sujalbhundere522@gmail.com",
        role="admin"
    )
    admin.set_password("sujal123")
    db.session.add(admin)

    for index, (name, city, state, stream, website) in enumerate(colleges_data):

        placement = get_placement_data(stream)

        college = College(
            name=name,
            city=city,
            state=state,
            stream=stream,
            fees=get_stream_fee(stream),
            cutoff=random.randint(60, 95),
            ranking=rankings[name],
            rating=round(random.uniform(4.0, 4.9), 1),
            placement_rate=placement["placement_rate"],
            avg_package=placement["avg_package"],
            highest_package=placement["highest_package"],
            recruiters=get_recruiters(stream),
            facilities=get_facilities(stream),
            about=generate_about(name, stream, city),
            courses=json.dumps(generate_courses(stream)),
            phone="0123456789",
            email=f"info@{name.replace(' ', '').lower()}.edu",
            address=f"{city}, {state}",
            website=website,
            image_url="https://images.unsplash.com/photo-1562774053-701939374585"
        )

        db.session.add(college)

    db.session.commit()

    print(f"Database seeded successfully with {total_colleges} colleges!")