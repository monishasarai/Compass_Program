import os
import json
import uuid
import datetime
from typing import Optional, Dict, List
from passlib.context import CryptContext
from jose import jwt, JWTError
from app.config import config
from app.models import UserRegister, UserLogin, UserResponse, UserRole

# Use pwd_context with fallback to simple sha256 hashing if bcrypt has C-extension issues
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def __init__(self):
        self.db_file = os.path.join(config.DATA_DIR, "users.json")
        self._ensure_db()

    def _ensure_db(self):
        os.makedirs(config.DATA_DIR, exist_ok=True)
        if not os.path.exists(self.db_file):
            # Create initial DB with default Admin and Demo User
            admin_pass = self.hash_password("AdminValid8@2026")
            user_pass = self.hash_password("UserValid8@2026")
            
            initial_users = {
                "admin-001": {
                    "id": "admin-001",
                    "name": "Platform Administrator",
                    "email": "admin@valid8.ai",
                    "password_hash": admin_pass,
                    "role": UserRole.ADMIN,
                    "createdAt": "2026-01-15T09:00:00Z",
                    "totalVerifications": 142,
                    "tokensUsed": 458900
                },
                "user-001": {
                    "id": "user-001",
                    "name": "Sarah Connor",
                    "email": "sarah@enterprise.io",
                    "password_hash": user_pass,
                    "role": UserRole.USER,
                    "createdAt": "2026-02-01T14:30:00Z",
                    "totalVerifications": 28,
                    "tokensUsed": 92100
                }
            }
            with open(self.db_file, "w") as f:
                json.dump(initial_users, f, indent=2)

    def _read_users(self) -> Dict[str, dict]:
        try:
            with open(self.db_file, "r") as f:
                return json.load(f)
        except Exception:
            return {}

    def _write_users(self, users: Dict[str, dict]):
        with open(self.db_file, "w") as f:
            json.dump(users, f, indent=2)

    def hash_password(self, password: str) -> str:
        try:
            return pwd_context.hash(password)
        except Exception:
            import hashlib
            return hashlib.sha256(password.encode()).hexdigest()

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception:
            import hashlib
            return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

    def register(self, req: UserRegister) -> UserResponse:
        users = self._read_users()
        for u in users.values():
            if u["email"].lower() == req.email.lower():
                raise ValueError("User with this email already exists.")

        user_id = f"user-{uuid.uuid4().hex[:8]}"
        new_user = {
            "id": user_id,
            "name": req.name,
            "email": req.email,
            "password_hash": self.hash_password(req.password),
            "role": req.role if req.role in [UserRole.ADMIN, UserRole.USER] else UserRole.USER,
            "createdAt": datetime.datetime.utcnow().isoformat() + "Z",
            "totalVerifications": 0,
            "tokensUsed": 0
        }
        users[user_id] = new_user
        self._write_users(users)
        return UserResponse(
            id=user_id,
            name=new_user["name"],
            email=new_user["email"],
            role=new_user["role"],
            createdAt=new_user["createdAt"],
            totalVerifications=0,
            tokensUsed=0
        )

    def login(self, req: UserLogin) -> Dict:
        users = self._read_users()
        target_user = None
        for u in users.values():
            if u["email"].lower() == req.email.lower():
                target_user = u
                break
        
        if not target_user or not self.verify_password(req.password, target_user["password_hash"]):
            raise ValueError("Invalid email or password.")

        token = self.create_jwt_token(target_user["id"], target_user["role"])
        user_res = UserResponse(
            id=target_user["id"],
            name=target_user["name"],
            email=target_user["email"],
            role=target_user["role"],
            createdAt=target_user["createdAt"],
            totalVerifications=target_user.get("totalVerifications", 0),
            tokensUsed=target_user.get("tokensUsed", 0)
        )
        return {"token": token, "user": user_res}

    def create_jwt_token(self, user_id: str, role: str) -> str:
        payload = {
            "sub": user_id,
            "role": role,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
        }
        return jwt.encode(payload, config.SECRET_KEY, algorithm=config.ALGORITHM)

    def decode_token(self, token: str) -> Optional[Dict]:
        try:
            payload = jwt.decode(token, config.SECRET_KEY, algorithms=[config.ALGORITHM])
            return payload
        except JWTError:
            return None

    def get_all_users(self) -> List[UserResponse]:
        users = self._read_users()
        return [
            UserResponse(
                id=u["id"],
                name=u["name"],
                email=u["email"],
                role=u["role"],
                createdAt=u["createdAt"],
                totalVerifications=u.get("totalVerifications", 0),
                tokensUsed=u.get("tokensUsed", 0)
            ) for u in users.values()
        ]

    def get_user_by_id(self, user_id: str) -> Optional[UserResponse]:
        users = self._read_users()
        u = users.get(user_id)
        if not u:
            return None
        return UserResponse(
            id=u["id"],
            name=u["name"],
            email=u["email"],
            role=u["role"],
            createdAt=u["createdAt"],
            totalVerifications=u.get("totalVerifications", 0),
            tokensUsed=u.get("tokensUsed", 0)
        )

    def change_password(self, user_id: str, old_password: str, new_password: str) -> bool:
        users = self._read_users()
        if user_id not in users:
            raise ValueError("User not found.")
        
        user = users[user_id]
        if not self.verify_password(old_password, user["password_hash"]):
            raise ValueError("Current password is incorrect.")
            
        if len(new_password) < 6:
            raise ValueError("New password must be at least 6 characters long.")
            
        user["password_hash"] = self.hash_password(new_password)
        self._write_users(users)
        return True

    def update_profile(self, user_id: str, name: str) -> UserResponse:
        users = self._read_users()
        if user_id not in users:
            raise ValueError("User not found.")
        
        users[user_id]["name"] = name
        self._write_users(users)
        return self.get_user_by_id(user_id)

    def increment_usage(self, user_id: str, tokens: int = 1500):
        users = self._read_users()
        if user_id in users:
            users[user_id]["totalVerifications"] = users[user_id].get("totalVerifications", 0) + 1
            users[user_id]["tokensUsed"] = users[user_id].get("tokensUsed", 0) + tokens
            self._write_users(users)

auth_service = AuthService()
