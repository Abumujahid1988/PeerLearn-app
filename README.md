# 📚 **PeerLearn — Micro-Learning & Peer Collaboration Platform (MVP)**

PeerLearn is a **peer-to-peer micro-learning platform** that enables students and instructors to learn together through **mini-courses, shared study resources, categories, and collaborative learning**.
This MVP implements **authentication**, **categories**, **courses**, **enrollment**, **role-based dashboards**, and **API integration**, forming the foundation of the full PeerLearn project.

---

# 🚀 **Tech Stack**

## **Frontend**

* React (Vite)
* Tailwind CSS v4
* React Router DOM
* Axios
* Context API (Auth)

## **Backend**

* Node.js + Express
* MongoDB + Mongoose
* JWT Authentication
* bcrypt
* CORS, dotenv

## **Deployment**

* **Frontend** → Vercel
* **Backend** → Render / Railway
* **Database** → MongoDB Atlas

---

# 📁 **Project Structure

```
peerlearn-mvp/
│
├── .gitignore                        # Ignore env, node_modules, build files, logs
├── README.md                         # Full project documentation
│
├── backend/                           # Backend - Express API
│   ├── server.js                     # Main entry point for the backend server
│   ├── package.json                  # Backend dependencies & scripts
│   ├── .env                          # Environment variables (Excluded from Git)
│   │
│   ├── config/
│   │   └── db.js                     # MongoDB connection logic
│   │
│   ├── middleware/
│   │   └── authMiddleware.js         # JWT validation for protected routes
│   │
│   ├── models/                       # Database schemas
│   │   ├── User.js                   # User schema (student/instructor roles)
│   │   ├── Course.js                 # Course schema
│   │   ├── Category.js               # Course category schema
│   │   └── Enrollment.js             # Tracks which student enrolled in which course
│   │
│   ├── controllers/                  # Route handlers (business logic)
│   │   ├── authController.js         # Register, login, get me
│   │   ├── courseController.js       # Course CRUD logic
│   │   ├── categoryController.js     # Category management
│   │   └── enrollmentController.js   # Enrollment logic
│   │
│   ├── routes/                       # Express route files
│   │   ├── authRoutes.js             # /auth
│   │   ├── courseRoutes.js           # /courses
│   │   ├── categoryRoutes.js         # /categories
│   │   └── enrollmentRoutes.js       # /enroll
│
│
├── frontend/                         # Frontend - React App
│   ├── package.json                  # Frontend dependencies
│   ├── vite.config.js                # Vite build configuration
│   ├── index.html                    # Main HTML template
│   │
│   ├── public/                       # Static assets
│   │
│   ├── src/
│   │   ├── main.jsx                  # React entry point
│   │   ├── App.jsx                   # App wrapper component
│   │   │
│   │   ├── api/
│   │   │   └── axios.js              # Axios instance with baseURL + token interceptor
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Auth management (login/register/logout)
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Top navigation bar
│   │   │   ├── Footer.jsx            # Footer with subscription text input
│   │   │   
│   │   │
│   │   ├── pages/                    # Frontend views
│   │   │   ├── Home.jsx              # Landing page with course listings
│   │   │   ├── Login.jsx             # Login page
│   │   │   ├── Register.jsx          # Register page
│   │   │   ├── Courses.jsx           # Courses list page
│   │   │   ├── CourseDetails.jsx     # Single course details page
│   │   │   ├── Dashboard.jsx         # Student/Instructor dashboard (role-based)
│   │   │   └── CreateCourse.jsx      # Instructor creates new course
│   │   │
│   │   ├── styles/
│   │   │   ├── index.css             # Tailwind entry styles
│   
└── .env.example                      # Sample env for developers
```

---

# 📌 **.gitignore**

```
# Node Modules
node_modules/
server/node_modules/
frontend/node_modules/

# Env Files
.env

---

# 🧩 **MVP Features**

## 1️⃣ **User Authentication**

* Register (student or instructor)
* Login with JWT
* Auto-authenticate with `/auth/me`
* Logout
* Protected routes on frontend

---

## 2️⃣ **User Roles**

### 🎓 **Student**

* Enroll in courses
* Access student dashboard

### 👨‍🏫 **Instructor**

* Create and manage courses
* Manage categories (optional extension)
* Instructor dashboard

---

## 3️⃣ **Course Module**

* Create, update, delete courses (instructors only)
* Fetch all courses
* View single course details
* Category assignment

---

## 4️⃣ **Categories**

* Create categories
* Get all categories
* Attach category to course

---

## 5️⃣ **Enrollments**

* Students enroll in courses
* Prevent duplicate enrollment
* Dashboard displays enrolled courses

---

# 🖥️ **Frontend Pages**

* **Home**
* **Login**
* **Register**
* **Courses**
* **Course Details**
* **Dashboard (role-based)**
* **Create Course (Instructor only)**

---

# 🔌 **API Endpoints**

## **Auth**

| Method | Route            | Description          |
| ------ | ---------------- | -------------------- |
| POST   | `/auth/register` | Register user        |
| POST   | `/auth/login`    | Login user           |
| GET    | `/auth/me`       | Fetch logged-in user |

---

## **Courses**

| Method | Route          | Description     |
| ------ | -------------- | --------------- |
| POST   | `/courses`     | Create course   |
| GET    | `/courses`     | Get all courses |
| GET    | `/courses/:id` | Get one course  |
| PUT    | `/courses/:id` | Update course   |
| DELETE | `/courses/:id` | Delete course   |

---

## **Categories**

| Method | Route         | Description     |
| ------ | ------------- | --------------- |
| POST   | `/categories` | Create category |
| GET    | `/categories` | Get categories  |

---

## **Enrollments**

| Method | Route               | Description             |
| ------ | ------------------- | ----------------------- |
| POST   | `/enroll/:courseId` | Enroll student          |
| GET    | `/enroll/mine`      | Get student enrollments |

---

# ⚙️ **Environment Variables**

## Backend `.env`

```
PORT=5000
MONGO_URI=your_mongodb_uri or mongodb Atlas
JWT_SECRET=your_jwt_secret
CLIENT_ALLOWED_ORIGIN=http://localhost:5173
```

## Frontend `.env`

```
VITE_API_URL=http://localhost:5000/api
```

---

# ▶️ **Run Locally**

## Backend

```bash
cd backend
npm install
npm run dev
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# 🚀 **Deployment Workflow**

### **Frontend → Vercel**

* Add `VITE_API_URL`
* Deploy

### **Backend → Render/Railway**

* Add environment variables
* Deploy

### **Database → MongoDB Atlas**

---

# 📌 **Future Enhancements**

* Full course modules & lessons
* Video uploads or YouTube integration
* Student progress tracking
* In-app messaging
* Admin panel
* AI tutor assistant
* Payment integration

---

# ❤️ **Credit**

Created by **Abdullahi Abdulganiyu**
For the **PeerLearn Final Project Initiative**

---
