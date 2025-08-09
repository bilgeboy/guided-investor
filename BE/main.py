from app.factory import create_app

# ה"אפליקציה" האמיתית נוצרת מפונקציה חיצונית
app = create_app()

# הפעלה מקומית:
# uvicorn backend.main:app --reload --port 8000