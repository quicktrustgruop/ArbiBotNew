import os
from app import app

# Ensure database connection is configured
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
