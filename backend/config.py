import os
from dotenv import load_dotenv

# Load environment variables from .env file
# Create a .env file in your project root for these variables
# Example .env:
# SECRET_KEY=a_very_strong_random_secret_key_here
# JWT_SECRET_KEY=another_strong_random_jwt_secret_key
# DATABASE_URL=sqlite:///../instance/ecofinds.sqlite
# UPLOAD_FOLDER=instance/uploads
# FLASK_STATIC_UPLOADS_URL=/uploads
load_dotenv()

class Config:
    """
    Configuration class for the Flask application.
    Attributes are loaded from environment variables or default values.
    """
    # Secret key for session management, CSRF protection, etc.
    # IMPORTANT: Change this in your production environment!
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your_default_secret_key_please_change_me'

    # Database URI for SQLAlchemy
    # Defaults to an SQLite database in the instance folder
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///../instance/ecofinds.sqlite'
    SQLALCHEMY_TRACK_MODIFICATIONS = False # Disable modification tracking to save resources

    # Secret key for JWT (JSON Web Tokens)
    # IMPORTANT: Change this in your production environment!
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'your_jwt_secret_key_please_change_me'
    # Optional: Configure token expiration times
    # from datetime import timedelta
    # JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    # JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # Base directory of the application (project root)
    # Assumes config.py is at the root of the backend project, alongside 'app' and 'instance' folders
    BASE_DIR = os.path.abspath(os.path.dirname(__file__)) 

    # Configuration for file uploads
    # Files will be stored in instance/uploads relative to the project root
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER') or os.path.join(BASE_DIR, 'instance', 'uploads')
    # URL path from which uploaded files will be served
    FLASK_STATIC_UPLOADS_URL = os.environ.get('FLASK_STATIC_UPLOADS_URL') or '/uploads'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'} # Allowed image extensions
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # Example: 16MB max upload size

    # CORS configuration (Cross-Origin Resource Sharing)
    # For development, '*' allows all origins. Restrict this in production.
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*') # Example: "http://localhost:8080,https://yourapp.com"
    CORS_SUPPORTS_CREDENTIALS = True # Important for sending cookies/auth headers with requests
