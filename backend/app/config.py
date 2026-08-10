import os

class Config:
    PROJECT_NAME = "Valid8 - Fact Verification & Hallucination Detection Engine"
    API_PREFIX = "/api/v1"
    SECRET_KEY = os.getenv("JWT_SECRET_KEY", "valid8-super-secret-key-2026")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours
    
    # Storage Paths
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ENV_FILE = os.path.join(BASE_DIR, ".env")
    
    # Load .env file variables if present
    if os.path.exists(ENV_FILE):
        with open(ENV_FILE, "r") as f:
            for line in f:
                if line.strip() and not line.startswith("#") and "=" in line:
                    key, val = line.strip().split("=", 1)
                    os.environ[key.strip()] = val.strip()

    DATA_DIR = os.path.join(BASE_DIR, "data")
    CHROMA_DIR = os.path.join(DATA_DIR, "chroma_db")
    DB_FILE = os.path.join(DATA_DIR, "valid8.db")
    
    # API Keys
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")

config = Config()
