import os
import re
import json
import logging
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import fitz  # PyMuPDF
import joblib
import numpy as np

# Set up logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("resume_intelligence")

# Path resolving for models
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
POSSIBLE_PKG_DIRS = [
    os.path.join(BASE_DIR, "..", "resume_intelligence_package"),
    os.path.join(BASE_DIR, "resume_intelligence_package"),
    os.path.join(os.getcwd(), "job-portal", "resume_intelligence_package"),
    os.path.join(os.getcwd(), "resume_intelligence_package"),
]

PKG_DIR = None
for d in POSSIBLE_PKG_DIRS:
    if os.path.isdir(d) and os.path.exists(os.path.join(d, "role_model.joblib")):
        PKG_DIR = os.path.abspath(d)
        break

if not PKG_DIR:
    PKG_DIR = os.path.abspath(POSSIBLE_PKG_DIRS[0])

logger.info(f"Model package directory: {PKG_DIR}")

# Global models cache
MODELS = {
    "role_model": None,
    "skill_model": None,
    "mlb": None,
    "taxonomy": None
}

# Role Mapping Dictionary
ROLE_MAPPING: Dict[str, str] = {
    'ACCOUNTANT': 'Accountant / Financial Specialist',
    'ADVOCATE': 'Legal Advocate / Corporate Counsel',
    'AGRICULTURE': 'Agricultural Operations Specialist',
    'APPAREL': 'Apparel & Fashion Merchandiser',
    'ARTS': 'Creative Visual Artist',
    'AUTOMOBILE': 'Automobile Engineer / Technician',
    'AVIATION': 'Aviation Operations Specialist',
    'BANKING': 'Banking & Financial Services Officer',
    'BPO': 'Customer Support & BPO Specialist',
    'BUSINESS-DEVELOPMENT': 'Business Development Executive (BDE)',
    'CHEF': 'Chef / Culinary Specialist',
    'CONSTRUCTION': 'Civil / Construction Supervisor',
    'CONSULTANT': 'Business Consultant / Strategy Advisor',
    'DESIGNER': 'Senior UI/UX & Product Designer',
    'DIGITAL-MEDIA': 'Digital Media & Growth Specialist',
    'ENGINEERING': 'Core Engineering Specialist',
    'FINANCE': 'Finance Manager / Investment Analyst',
    'FITNESS': 'Fitness & Wellness Coach',
    'HEALTHCARE': 'Healthcare & Medical Professional',
    'HR': 'Human Resources (HR) & Talent Specialist',
    'INFORMATION-TECHNOLOGY': 'Software Engineer / IT Developer',
    'PUBLIC-RELATIONS': 'Public Relations & Communications',
    'SALES': 'Sales Executive / Field Sales Manager'
}

# Standard Skill Replacements
STANDARDIZED_SKILLS: Dict[str, str] = {
    'html': 'HTML5',
    'html5': 'HTML5',
    'css': 'CSS3',
    'css3': 'CSS3',
    'js': 'JavaScript',
    'javascript': 'JavaScript',
    'ts': 'TypeScript',
    'typescript': 'TypeScript',
    'react': 'React.js',
    'reactjs': 'React.js',
    'react.js': 'React.js',
    'react native': 'React Native',
    'vue': 'Vue.js',
    'vuejs': 'Vue.js',
    'angular': 'Angular',
    'angularjs': 'Angular',
    'node': 'Node.js',
    'nodejs': 'Node.js',
    'node.js': 'Node.js',
    'express': 'Express.js',
    'expressjs': 'Express.js',
    'python': 'Python',
    'java': 'Java',
    'c++': 'C++',
    'c#': 'C#',
    '.net': '.NET',
    'php': 'PHP',
    'sql': 'SQL',
    'mysql': 'MySQL',
    'postgresql': 'PostgreSQL',
    'mongodb': 'MongoDB',
    'aws': 'AWS Cloud',
    'azure': 'Azure',
    'gcp': 'Google Cloud',
    'docker': 'Docker',
    'kubernetes': 'Kubernetes',
    'git': 'Git',
    'github': 'GitHub',
    'figma': 'Figma',
    'ui/ux': 'UI/UX Design',
    'ui': 'User Interface (UI)',
    'ux': 'User Experience (UX)',
    'wireframing': 'Wireframing',
    'prototyping': 'Prototyping',
    'design systems': 'Design Systems',
    'photoshop': 'Adobe Photoshop',
    'illustrator': 'Adobe Illustrator',
    'indesign': 'Adobe InDesign',
    'canva': 'Canva',
    'ms excel': 'Microsoft Excel',
    'excel': 'Microsoft Excel',
    'ms office': 'Microsoft Office Suite',
    'word': 'Microsoft Word',
    'powerpoint': 'Microsoft PowerPoint',
    'b2b': 'B2B Sales',
    'b2c': 'B2C Sales',
    'seo': 'SEO Optimization',
    'sem': 'Search Engine Marketing',
    'lead generation': 'Lead Generation',
    'crm': 'CRM Management',
    'salesforce': 'Salesforce',
    'tally': 'Tally Prime / ERP',
    'quickbooks': 'QuickBooks',
    'accounting': 'Financial Accounting',
    'gst': 'GST Compliance',
    'autocad': 'AutoCAD'
}

# Non-technical / generic words to strictly filter out
EXCLUDED_WORDS = {
    'video', 'content', 'strategy', 'management', 'team', 'work', 'working',
    'support', 'services', 'business', 'process', 'operations', 'customer',
    'company', 'project', 'projects', 'communication', 'time', 'years',
    'experience', 'responsible', 'skills', 'role', 'roles', 'general',
    'handling', 'day', 'days', 'new', 'good', 'strong', 'etc', 'various',
    'system', 'systems', 'reporting', 'analysis', 'environment', 'high', 'level',
    'client', 'clients', 'sales', 'retail', 'documentation', 'designing',
    'windows', 'team player', 'microsoft office', 'customer service',
    'advertising', 'product development', 'office', 'writing', 'training'
}

KNOWN_JOB_TITLES = [
    (r'Product\s+Designer', 'Product Designer & UI/UX Designer'),
    (r'UI/?UX\s+Designer', 'Senior UI/UX Designer'),
    (r'UX/?UI\s+Designer', 'Senior UI/UX Designer'),
    (r'UX\s+Designer', 'User Experience (UX) Designer'),
    (r'UI\s+Designer', 'User Interface (UI) Designer'),
    (r'Frontend\s+Developer', 'Frontend Software Developer'),
    (r'Full\s+Stack\s+Developer', 'Full Stack Software Engineer'),
    (r'Backend\s+Developer', 'Backend Software Developer'),
    (r'Software\s+Engineer', 'Software Engineer'),
    (r'Web\s+Developer', 'Web Application Developer'),
    (r'Mobile\s+App\s+Developer', 'Mobile App Developer (iOS/Android)'),
    (r'Android\s+Developer', 'Android Application Developer'),
    (r'iOS\s+Developer', 'iOS Application Developer'),
    (r'Graphic\s+Designer', 'Graphic & Visual Designer'),
    (r'Visual\s+Designer', 'Visual & Brand Designer'),
    (r'Data\s+Scientist', 'Data Scientist / ML Engineer'),
    (r'Data\s+Analyst', 'Data & Business Intelligence Analyst'),
    (r'Business\s+Development\s+Manager', 'Business Development Manager (BDM)'),
    (r'Business\s+Development\s+Executive', 'Business Development Executive (BDE)'),
    (r'Sales\s+Manager', 'Sales & Growth Manager'),
    (r'Sales\s+Executive', 'Sales Executive / Field Sales'),
    (r'Accountant', 'Accountant & Financial Specialist'),
    (r'HR\s+Manager', 'Human Resources (HR) Manager'),
    (r'Talent\s+Acquisition', 'Talent Acquisition & Recruiter')
]


def extract_direct_job_title(text: str) -> Optional[str]:
    """Inspect top 15 lines of resume to find exact primary professional title."""
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    header_snippet = " \n ".join(lines[:15])

    for pattern, title in KNOWN_JOB_TITLES:
        if re.search(r'\b' + pattern + r'\b', header_snippet, re.IGNORECASE):
            return title
    return None


def load_models():
    """Load joblib models and taxonomy from disk into memory."""
    logger.info("Loading ML models into memory...")
    try:
        MODELS["mlb"] = joblib.load(os.path.join(PKG_DIR, "mlb.joblib"))
        logger.info(f"Loaded MLB with {len(MODELS['mlb'].classes_)} classes.")
    except Exception as e:
        logger.error(f"Failed to load mlb.joblib: {e}")

    try:
        MODELS["role_model"] = joblib.load(os.path.join(PKG_DIR, "role_model.joblib"))
        logger.info(f"Loaded Role Model with {len(MODELS['role_model'].classes_)} classes.")
    except Exception as e:
        logger.error(f"Failed to load role_model.joblib: {e}")

    try:
        tax_path = os.path.join(PKG_DIR, "taxonomy.json")
        if os.path.exists(tax_path):
            with open(tax_path, "r", encoding="utf-8") as f:
                MODELS["taxonomy"] = json.load(f)
            logger.info("Loaded Taxonomy dictionary.")
    except Exception as e:
        logger.error(f"Failed to load taxonomy.json: {e}")

    try:
        MODELS["skill_model"] = joblib.load(os.path.join(PKG_DIR, "skill_model.joblib"))
        logger.info("Loaded Skill Extraction Model successfully.")
    except Exception as e:
        logger.error(f"Failed to load skill_model.joblib: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load models
    load_models()
    yield
    # Shutdown
    MODELS.clear()


app = FastAPI(
    title="Alifeo Resume Intelligence API",
    description="Dual ML pipeline for automated Skill Extraction and Job Role Classification",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend and API gateways
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalysisResponse(BaseModel):
    success: bool
    predicted_role: str
    role_category: str
    role_confidence: float
    extracted_skills: List[str]
    raw_skills_count: int
    text_length: int
    suggested_headline: str


class TextAnalysisRequest(BaseModel):
    text: str


def clean_analysis(raw_role: str, raw_skills: List[str], text: str) -> Dict[str, Any]:
    """
    Standardize programming skills, filter non-technical noise,
    and map uppercase model labels to polished human-friendly job roles.
    """
    # 1. Map role
    if "UI/UX" in raw_role or "&" in raw_role:
        clean_role = raw_role
    else:
        clean_role = ROLE_MAPPING.get(raw_role.upper().strip(), raw_role.title())

    # 2. Clean and standardize skills
    cleaned_skills_set = set()
    cleaned_skills_list = []

    for s in raw_skills:
        s_norm = s.strip().lower()
        if not s_norm or len(s_norm) < 2:
            continue
        if s_norm in EXCLUDED_WORDS:
            continue

        # Standardize programming language / tool naming
        std_name = STANDARDIZED_SKILLS.get(s_norm, s.title())
        if std_name not in cleaned_skills_set:
            cleaned_skills_set.add(std_name)
            cleaned_skills_list.append(std_name)

    # 3. Auxiliary pattern scan: If resume text contains obvious keywords not in ML top skills
    text_lower = text.lower()
    aux_checks = [
        ("figma", "Figma"),
        ("ui/ux", "UI/UX Design"),
        ("wireframing", "Wireframing"),
        ("prototyping", "Prototyping"),
        ("react", "React.js"),
        ("python", "Python"),
        ("sql", "SQL"),
        ("photoshop", "Adobe Photoshop"),
        ("illustrator", "Adobe Illustrator"),
        ("canva", "Canva"),
        ("excel", "Microsoft Excel"),
        ("b2b", "B2B Sales")
    ]
    for pattern, label in aux_checks:
        if pattern in text_lower and label not in cleaned_skills_set:
            cleaned_skills_set.add(label)
            cleaned_skills_list.append(label)

    # Sort skills by presence & quality (limit to top 8 clean, high-impact skills)
    cleaned_skills_list = cleaned_skills_list[:8]

    # Headline construction
    headline = f"{clean_role} | {', '.join(cleaned_skills_list[:3])}" if cleaned_skills_list else clean_role

    return {
        "predicted_role": clean_role,
        "role_category": raw_role,
        "extracted_skills": cleaned_skills_list,
        "suggested_headline": headline
    }


def predict_pipeline(text: str) -> Dict[str, Any]:
    """Execute dual ML model inference on parsed resume text with direct title detection."""
    if not MODELS["role_model"] or not MODELS["skill_model"] or not MODELS["mlb"]:
        raise HTTPException(status_code=503, detail="Models are not loaded into memory.")

    # 1. Role Inference: Direct header title extraction takes precedence over low-confidence ML guess
    direct_title = extract_direct_job_title(text)

    role_model = MODELS["role_model"]
    pred_role = role_model.predict([text])[0]
    conf = 0.85
    if hasattr(role_model, "predict_proba"):
        probas = role_model.predict_proba([text])[0]
        conf = float(np.max(probas))

    # 2. Skill Inference
    skill_model = MODELS["skill_model"]
    mlb = MODELS["mlb"]

    extracted_raw_skills = []
    if hasattr(skill_model, "predict_proba"):
        probs = skill_model.predict_proba([text])[0]
        top_indices = np.argsort(probs)[::-1]
        for idx in top_indices:
            p = float(probs[idx])
            s_name = str(mlb.classes_[idx]).lower().strip()
            # Only include if not in excluded noise words
            if s_name not in EXCLUDED_WORDS and (p >= 0.28 or (len(extracted_raw_skills) < 8 and p >= 0.15)):
                extracted_raw_skills.append(str(mlb.classes_[idx]))
            if len(extracted_raw_skills) >= 15:
                break
    else:
        pred_bin = skill_model.predict([text])
        inv = mlb.inverse_transform(pred_bin)
        extracted_raw_skills = list(inv[0]) if inv and len(inv) > 0 else []

    # 3. Post-Processing Filter & Standardization
    target_role = direct_title if direct_title else pred_role
    cleaned = clean_analysis(target_role, extracted_raw_skills, text)

    return {
        "success": True,
        "predicted_role": cleaned["predicted_role"],
        "role_category": cleaned["role_category"],
        "role_confidence": 0.95 if direct_title else round(conf, 4),
        "extracted_skills": cleaned["extracted_skills"],
        "raw_skills_count": len(extracted_raw_skills),
        "text_length": len(text),
        "suggested_headline": cleaned["suggested_headline"]
    }


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Alifeo Resume Intelligence ML Engine",
        "endpoints": ["/analyze-resume (POST PDF)", "/analyze-text (POST JSON)"]
    }


@app.post("/analyze-resume", response_model=AnalysisResponse)
async def analyze_resume_pdf(file: UploadFile = File(...)):
    """Accepts PDF resume upload, extracts text via PyMuPDF, and returns ML role & skills."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported for ML parsing.")

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        doc = fitz.open(stream=contents, filetype="pdf")
        text_pages = [page.get_text("text") for page in doc]
        raw_text = "\n".join(text_pages).strip()
    except Exception as e:
        logger.error(f"Failed to parse PDF with PyMuPDF: {e}")
        raise HTTPException(status_code=422, detail="Could not parse text from this PDF file.")

    if len(raw_text) < 20:
        raise HTTPException(status_code=422, detail="Extracted text is too short or PDF is a scanned image.")

    return predict_pipeline(raw_text)


@app.post("/analyze-text", response_model=AnalysisResponse)
async def analyze_resume_text(body: TextAnalysisRequest):
    """Direct text inference endpoint."""
    text = (body.text or "").strip()
    if len(text) < 20:
        raise HTTPException(status_code=400, detail="Text must be at least 20 characters long.")
    return predict_pipeline(text)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=False)
