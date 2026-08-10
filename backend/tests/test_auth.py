import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.auth_service import auth_service

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "Valid8" in data["service"]

def test_auth_register_login_flow():
    test_email = "testuser_suite@valid8.ai"
    test_pass = "TestPassword123!"
    
    # Clean up existing test user if present
    users = auth_service._read_users()
    users_to_keep = {k: v for k, v in users.items() if v.get("email") != test_email}
    auth_service._write_users(users_to_keep)

    # 1. Register user
    reg_payload = {
        "name": "Suite Tester",
        "email": test_email,
        "password": test_pass,
        "role": "user"
    }
    response = client.post("/api/v1/auth/register", json=reg_payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["email"] == test_email
    assert res_data["name"] == "Suite Tester"
    user_id = res_data["id"]

    # 2. Duplicate registration attempt should fail (400)
    response_dup = client.post("/api/v1/auth/register", json=reg_payload)
    assert response_dup.status_code == 400

    # 3. Login with wrong password should fail (401)
    response_wrong = client.post("/api/v1/auth/login", json={"email": test_email, "password": "WrongPassword"})
    assert response_wrong.status_code == 401

    # 4. Login with correct password
    response_login = client.post("/api/v1/auth/login", json={"email": test_email, "password": test_pass})
    assert response_login.status_code == 200
    login_data = response_login.json()
    assert "token" in login_data
    token = login_data["token"]
    assert login_data["user"]["email"] == test_email

    # 5. Fetch /auth/me with Bearer token
    headers = {"Authorization": f"Bearer {token}"}
    response_me = client.get("/api/v1/auth/me", headers=headers)
    assert response_me.status_code == 200
    assert response_me.json()["id"] == user_id

    # 6. Update Profile
    update_payload = {"name": "Suite Tester Updated"}
    response_update = client.put("/api/v1/auth/update-profile", json=update_payload, headers=headers)
    assert response_update.status_code == 200
    assert response_update.json()["name"] == "Suite Tester Updated"

    # 7. Change Password
    change_pass_payload = {"current_password": test_pass, "new_password": "NewSecretPass123!"}
    response_cp = client.post("/api/v1/auth/change-password", json=change_pass_payload, headers=headers)
    assert response_cp.status_code == 200
    assert response_cp.json()["status"] == "success"

    # 8. Verify login with old password fails, new password succeeds
    login_old = client.post("/api/v1/auth/login", json={"email": test_email, "password": test_pass})
    assert login_old.status_code == 401
    login_new = client.post("/api/v1/auth/login", json={"email": test_email, "password": "NewSecretPass123!"})
    assert login_new.status_code == 200

def test_admin_metrics_and_users():
    admin_login = client.post("/api/v1/auth/login", json={"email": "admin@valid8.ai", "password": "AdminValid8@2026"})
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    users_res = client.get("/api/v1/admin/users", headers=headers)
    assert users_res.status_code == 200
    assert isinstance(users_res.json(), list)

    metrics_res = client.get("/api/v1/admin/metrics", headers=headers)
    assert metrics_res.status_code == 200
    m_data = metrics_res.json()
    assert "total_registered_users" in m_data
    assert "total_active_documents" in m_data
