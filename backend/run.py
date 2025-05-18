from app import create_app, db # Import create_app factory and db instance
# from app.models import User, Product, CartItem, Purchase, PurchaseItem # Import models if needed for seeding

# Create the Flask app instance using the factory
# This allows for different configurations (e.g., testing, production)
app = create_app() 

# The 'with app.app_context()' block is crucial for operations
# that require access to the application context, such as database operations
# or accessing app.config.
#
# For example, if you wanted to create database tables directly (without migrations)
# or seed initial data, you would do it here.
# However, for schema management, Flask-Migrate is the recommended approach.

# Example of how you might run db.create_all() (USE WITH CAUTION if using migrations)
# def initialize_database():
#     with app.app_context():
#         # The following line creates database tables based on your SQLAlchemy models.
#         # It's generally recommended to use Flask-Migrate for schema changes
#         # after the initial setup, as create_all() won't update existing tables.
#         # db.create_all()
#         # print("Database tables created (if they didn't exist).")
#
#         # Example: Seed initial data (optional)
#         # if not User.query.first(): # Check if db is empty
#         #     print("Seeding initial data...")
#         #     # Add sample users, products etc.
#         #     # user1 = User(username="testuser", email="test@example.com")
#         #     # user1.set_password("password123")
#         #     # db.session.add(user1)
#         #     # db.session.commit()
#         #     print("Initial data seeded.")
#         pass # Placeholder for any app context operations before running

if __name__ == '__main__':
    # initialize_database() # Call this if you have setup/seeding logic

    # Run the Flask development server
    # debug=True enables the Werkzeug debugger and reloader. Disable in production.
    # host='0.0.0.0' makes the server accessible externally (e.g., within your local network).
    # port=5000 is the default Flask port, can be changed.
    app.run(debug=True, host='0.0.0.0', port=5000)
