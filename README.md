# Vossai Project

A full-stack web application built with Django REST Framework and React (Vite).

## Tech Stack
- **Backend:** Django, Django REST Framework, SimpleJWT, MongoDB
- **Frontend:** React, Vite
- **Database:** SQLite (dev), MongoDB Atlas (prod)

## Setup

### Backend
```bash
cd vossai_project
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables
Create a `.env` file in the root:
```
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
MONGO_URI=mongodb://localhost:27017/
MONGO_DB_NAME=vossai_db
```