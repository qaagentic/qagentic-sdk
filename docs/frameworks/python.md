# Python SDK Guide

Complete guide for using QAagentic with Python testing frameworks.

---

## Installation

```bash
pip install qagentic-pytest
```

**Requirements:**
- Python 3.8+
- pytest 7.0+ (for pytest integration)

---

## pytest Integration

### Basic Setup

QAagentic automatically integrates with pytest. Just install and run:

```bash
pytest --qagentic
```

### Configuration Options

```bash
# Command line options
pytest --qagentic                    # Enable QAagentic
pytest --qagentic-dir=./results      # Custom output directory
pytest --qagentic-api-url=URL        # API endpoint
pytest --qagentic-api-key=KEY        # API key
pytest --qagentic-project=NAME       # Project name
pytest --qagentic-env=ENV            # Environment
```

### pytest.ini Configuration

```ini
[pytest]
addopts = --qagentic
qagentic_dir = ./qagentic-results
qagentic_project = my-project
qagentic_environment = staging
```

### pyproject.toml Configuration

```toml
[tool.pytest.ini_options]
addopts = "--qagentic"

[tool.qagentic]
project_name = "my-project"
environment = "staging"
api_url = "https://api.qagentic.io"
output_dir = "./qagentic-results"
```

---

## Complete Example

```python
"""
Complete example demonstrating all QAagentic features.
File: tests/test_user_management.py
"""
import pytest
from qagentic import (
    feature, story, epic, severity, Severity,
    tag, owner, link, issue, testcase,
    description, title, label,
    step, attach_json, attach_screenshot, attach_text
)


@epic("User Management")
@feature("User Registration")
@story("New User Signup")
@severity(Severity.CRITICAL)
@owner("qa-team@company.com")
@tag("smoke", "regression", "signup")
@link("https://docs.company.com/signup", "Signup Documentation")
@issue("https://jira.company.com/browse/USER-123", "USER-123")
@testcase("https://testrail.company.com/index.php?/cases/view/TC-456", "TC-456")
@description("""
This test verifies the complete user registration flow:
1. Navigate to signup page
2. Fill in user details
3. Submit registration form
4. Verify confirmation email
5. Activate account
""")
@title("Complete User Registration Flow")
class TestUserRegistration:
    """Test suite for user registration functionality."""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test environment."""
        self.base_url = "https://app.example.com"
        self.test_user = {
            "email": "test@example.com",
            "password": "SecurePass123!",
            "name": "Test User"
        }
    
    def test_successful_registration(self):
        """Test successful user registration with valid data."""
        
        with step("Navigate to signup page"):
            # Simulate navigation
            current_url = f"{self.base_url}/signup"
            assert "signup" in current_url
        
        with step("Fill in registration form") as s:
            # Simulate form filling
            form_data = self.test_user.copy()
            s.attach_json(form_data, "Form Data")
            s.set_parameter("email", form_data["email"])
        
        with step("Submit registration form"):
            # Simulate form submission
            response = {"status": "success", "user_id": 12345}
            attach_json(response, "API Response")
        
        with step("Verify confirmation email sent"):
            # Simulate email verification
            email_sent = True
            assert email_sent, "Confirmation email should be sent"
        
        with step("Activate account"):
            # Simulate account activation
            account_active = True
            assert account_active, "Account should be activated"
    
    @severity(Severity.NORMAL)
    @tag("validation")
    def test_registration_with_invalid_email(self):
        """Test registration fails with invalid email format."""
        
        with step("Attempt registration with invalid email"):
            invalid_email = "not-an-email"
            
            with step("Submit form with invalid email") as s:
                s.set_parameter("email", invalid_email)
                error_message = "Invalid email format"
                attach_text(error_message, "Validation Error")
        
        with step("Verify error message displayed"):
            assert "Invalid email" in error_message
    
    @severity(Severity.MINOR)
    @tag("edge-case")
    def test_registration_with_existing_email(self):
        """Test registration fails when email already exists."""
        
        with step("Attempt registration with existing email"):
            existing_email = "existing@example.com"
            error = "Email already registered"
            
        with step("Verify appropriate error message"):
            assert "already registered" in error


@feature("User Authentication")
@story("User Login")
class TestUserLogin:
    """Test suite for user login functionality."""
    
    @severity(Severity.BLOCKER)
    @tag("smoke", "critical-path")
    def test_successful_login(self):
        """Test successful login with valid credentials."""
        
        with step("Navigate to login page"):
            pass
        
        with step("Enter valid credentials"):
            credentials = {"email": "user@example.com", "password": "valid"}
            attach_json(credentials, "Login Credentials (masked)")
        
        with step("Submit login form"):
            login_success = True
            assert login_success
        
        with step("Verify redirect to dashboard"):
            current_page = "dashboard"
            assert current_page == "dashboard"
    
    @severity(Severity.CRITICAL)
    def test_login_with_invalid_password(self):
        """Test login fails with incorrect password."""
        
        with step("Attempt login with wrong password"):
            login_success = False
            error_message = "Invalid credentials"
        
        with step("Verify error message"):
            assert not login_success
            assert "Invalid" in error_message
    
    @severity(Severity.NORMAL)
    @label("security", "brute-force")
    def test_account_lockout_after_failed_attempts(self):
        """Test account gets locked after multiple failed login attempts."""
        
        with step("Attempt login with wrong password 5 times"):
            for i in range(5):
                with step(f"Failed attempt {i + 1}"):
                    pass
        
        with step("Verify account is locked"):
            account_locked = True
            assert account_locked
        
        with step("Verify lockout message displayed"):
            message = "Account locked. Try again in 15 minutes."
            attach_text(message, "Lockout Message")


# Parametrized tests
@feature("User Authentication")
@story("Login Validation")
class TestLoginValidation:
    """Parametrized tests for login validation."""
    
    @pytest.mark.parametrize("email,password,expected_error", [
        ("", "password", "Email is required"),
        ("user@example.com", "", "Password is required"),
        ("invalid-email", "password", "Invalid email format"),
        ("user@example.com", "short", "Password too short"),
    ])
    @severity(Severity.NORMAL)
    @tag("validation")
    def test_login_validation(self, email, password, expected_error):
        """Test login form validation for various invalid inputs."""
        
        with step(f"Attempt login with email='{email}', password='{password}'"):
            attach_json({
                "email": email,
                "password": "***" if password else "",
                "expected_error": expected_error
            }, "Test Parameters")
        
        with step("Verify validation error"):
            # Simulate validation
            assert expected_error is not None
```

---

## Fixtures Integration

```python
import pytest
from qagentic import step, attach_json

@pytest.fixture
def api_client():
    """Create API client for tests."""
    with step("Initialize API client"):
        client = {"base_url": "https://api.example.com"}
        attach_json(client, "API Client Config")
        yield client
    
    with step("Cleanup API client"):
        # Cleanup code
        pass

@pytest.fixture
def test_user(api_client):
    """Create a test user."""
    with step("Create test user"):
        user = {"id": 123, "email": "test@example.com"}
        attach_json(user, "Created User")
        yield user
    
    with step("Delete test user"):
        # Cleanup user
        pass

def test_user_profile(api_client, test_user):
    """Test user profile retrieval."""
    with step("Fetch user profile"):
        profile = {"user_id": test_user["id"], "name": "Test User"}
        attach_json(profile, "User Profile")
    
    with step("Verify profile data"):
        assert profile["user_id"] == test_user["id"]
```

---

## Async Tests

```python
import pytest
from qagentic import step, attach_json

@pytest.mark.asyncio
async def test_async_api_call():
    """Test async API functionality."""
    
    with step("Make async API request"):
        # Simulate async call
        import asyncio
        await asyncio.sleep(0.1)
        response = {"status": "success"}
        attach_json(response, "Async Response")
    
    with step("Verify response"):
        assert response["status"] == "success"
```

---

## Best Practices

### 1. Organize Tests with Labels

```python
@epic("E-commerce Platform")
@feature("Shopping Cart")
@story("Add to Cart")
@severity(Severity.CRITICAL)
@tag("cart", "smoke")
def test_add_item_to_cart():
    pass
```

### 2. Use Descriptive Step Names

```python
# ❌ Bad
with step("Step 1"):
    pass

# ✅ Good
with step("Add product 'iPhone 15' to shopping cart"):
    pass
```

### 3. Attach Evidence

```python
def test_checkout():
    with step("Complete checkout") as s:
        result = checkout_service.process()
        s.attach_json(result, "Checkout Result")
        
        if result["status"] == "failed":
            s.attach_screenshot("checkout_error.png", "Error Screenshot")
```

### 4. Use Fixtures for Setup/Teardown

```python
@pytest.fixture
def authenticated_user():
    with step("Login as test user"):
        user = login("test@example.com", "password")
        yield user
    
    with step("Logout"):
        logout(user)
```

---

## Troubleshooting

### Plugin Not Loading

```bash
# Verify installation
pip show qagentic-pytest

# Check pytest plugins
pytest --co -q

# Run with verbose output
pytest --qagentic -v
```

### No Output Generated

```bash
# Check output directory permissions
ls -la ./qagentic-results

# Enable debug mode
QAGENTIC_DEBUG=true pytest --qagentic
```

### API Connection Issues

```python
# Test API connectivity
import httpx

response = httpx.get(
    "https://api.qagentic.io/health",
    headers={"X-API-Key": "your-key"}
)
print(response.status_code)
```
