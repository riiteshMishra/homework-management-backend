# 🖥️ Backend — Homework Management System

Node.js + Express REST API with MongoDB (Mongoose) and JWT-based authentication.

---

## 📁 Folder Structure

```
backend/
│
├── controllers/
│   ├── auth.controller.js         # Register, Login, Get user, Get students
│   ├── homework.controller.js     # Create, Update, Delete, Get homeworks
│   └── submit.controller.js       # Submit, Grade, Fetch results
│
├── models/
│   ├── UserModel.js               # Student / Teacher schema
│   ├── HomeworkModel.js           # Homework schema
│   └── SubmitModel.js             # Submission schema
│
├── middlewares/
│   ├── auth.js                    # JWT verification (auth, isTeacher, isStudent)
│
├── routes/
│   ├── auth.routes.js
│   ├── homework.routes.js
│   └── submission.routes.js
│
└── index.js                       # Entry point
```

---

## ⚙️ Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Create `.env` file

```env
PORT=4000
MONGO_URI=mongodb+srv://your-mongo-uri
JWT_SECRET=your_jwt_secret_key
```

### 3. Start server

```bash
npm run dev
```

Server runs on → `http://localhost:4000`

---

## 🌐 Base URL

```
http://localhost:4000/api/v1
```

---

## 🔐 Authentication

All protected routes require a JWT token in the request header:

```
Authorization: Bearer <your_token>
```

**Available Roles:**

| Role      | Description                                        |
| --------- | -------------------------------------------------- |
| `student` | Can view homeworks, submit answers, view results   |
| `teacher` | Can create/update/delete homeworks, grade students |

Middleware used:

- `auth` — verifies JWT token
- `isTeacher` — blocks if role is not teacher
- `isStudent` — blocks if role is not student

---

## 📡 API Routes

---

### 🔑 Auth Routes — `/api/v1/auth`

| Method | Endpoint            | Middleware | Description                           |
| ------ | ------------------- | ---------- | ------------------------------------- |
| POST   | `/sign-up`          | None       | Register a new user (student/teacher) |
| POST   | `/log-in`           | None       | Login and receive JWT token           |
| GET    | `/get-user-details` | `auth`     | Get logged-in user's details          |
| GET    | `/students`         | None       | Get list of all students              |

#### POST `/sign-up`

**Request Body:**

```json
{
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "password": "secret123",
  "role": "student"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "664abc...",
    "name": "Ravi Kumar",
    "email": "ravi@example.com",
    "role": "student"
  }
}
```

---

#### POST `/log-in`

**Request Body:**

```json
{
  "email": "ravi@example.com",
  "password": "secret123"
}
```

**Response:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "664abc...",
    "name": "Ravi Kumar",
    "email": "ravi@example.com",
    "role": "student"
  }
}
```

---

#### GET `/get-user-details`

Returns the currently logged-in user's info.

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "664abc...",
    "name": "Ravi Kumar",
    "email": "ravi@example.com",
    "role": "student"
  }
}
```

---

#### GET `/students`

Returns a list of all registered students. Useful for teachers when assigning homework.

**Response:**

```json
{
  "success": true,
  "data": [
    { "_id": "studentId1", "name": "Ravi Kumar", "email": "ravi@example.com" },
    { "_id": "studentId2", "name": "Priya Singh", "email": "priya@example.com" }
  ]
}
```

---

### 📝 Homework Routes — `/api/v1/homework`

| Method | Endpoint              | Middleware          | Description               |
| ------ | --------------------- | ------------------- | ------------------------- |
| POST   | `/create`             | `auth`, `isTeacher` | Create a new homework     |
| PATCH  | `/update`             | `auth`, `isTeacher` | Update a homework         |
| DELETE | `/delete/:homeworkId` | `auth`, `isTeacher` | Delete a homework         |
| GET    | `/homeworks`          | None                | Get all homeworks         |
| GET    | `/:homeworkId`        | None                | Get single homework by ID |

---

#### POST `/create`

**Headers:** `Authorization: Bearer <teacher_token>`

**Request Body:**

```json
{
  "title": "Chapter 5 Questions",
  "description": "Answer all questions from Chapter 5",
  "subject": "Mathematics",
  "dueDate": "2025-05-10",
  "students": ["studentId1", "studentId2"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Homework created successfully",
  "data": {
    "_id": "hw123",
    "title": "Chapter 5 Questions",
    "subject": "Mathematics",
    "status": "published",
    "dueDate": "2025-05-10T00:00:00.000Z",
    "students": ["studentId1", "studentId2"],
    "createdAt": "2025-04-20T10:00:00.000Z"
  }
}
```

---

#### PATCH `/update`

**Headers:** `Authorization: Bearer <teacher_token>`

**Request Body** (only include fields you want to update):

```json
{
  "homeworkId": "hw123",
  "title": "Updated Title",
  "dueDate": "2025-05-15"
}
```

---

#### DELETE `/delete/:homeworkId`

**Headers:** `Authorization: Bearer <teacher_token>`

```
DELETE /api/v1/homework/delete/hw123
```

**Response:**

```json
{
  "success": true,
  "message": "Homework deleted successfully"
}
```

---

#### GET `/homeworks`

Returns all homeworks. Accessible without auth (or as per your implementation).

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "hw123",
      "title": "Chapter 5 Questions",
      "subject": "Mathematics",
      "status": "published",
      "dueDate": "2025-05-10T00:00:00.000Z",
      "students": ["studentId1"],
      "submissions": ["submissionId1"],
      "createdAt": "2025-04-20T10:00:00.000Z"
    }
  ]
}
```

---

#### GET `/:homeworkId`

```
GET /api/v1/homework/hw123
```

Returns a single homework by its ID.

---

### 📤 Submission Routes — `/api/v1/submission`

| Method | Endpoint                     | Middleware          | Description                     |
| ------ | ---------------------------- | ------------------- | ------------------------------- |
| POST   | `/submit`                    | `auth`, `isStudent` | Student submits homework answer |
| GET    | `/all-submissions`           | `auth`, `isTeacher` | Teacher views all submissions   |
| POST   | `/create-result/:homeworkId` | `auth`, `isTeacher` | Teacher grades a submission     |
| GET    | `/result/:homeworkId`        | `auth`, `isStudent` | Student views their own result  |

---

#### POST `/submit`

Submit a homework answer. Accepts text and/or a file link (YouTube, Google Drive, etc.)

**Headers:**

```
Authorization: Bearer <student_token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**

| Field          | Type         | Required                         |
| -------------- | ------------ | -------------------------------- |
| `homeworkId`   | string       | ✅ Yes                           |
| `textAnswer`   | string       | ⚠️ Required if no `attachedFile` |
| `attachedFile` | string (URL) | ⚠️ Required if no `textAnswer`   |

**Example:**

```javascript
const formData = new FormData();
formData.append("homeworkId", "hw123");
formData.append("textAnswer", "The answer is 42.");
formData.append("attachedFile", "https://drive.google.com/file/d/abc123");

await fetch("http://localhost:4000/api/v1/submission/submit", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});
```

**Response:**

```json
{
  "success": true,
  "message": "Homework submitted successfully",
  "data": {
    "_id": "sub789",
    "student": "studentId1",
    "homework": "hw123",
    "textAnswer": "The answer is 42.",
    "attachedFile": "https://drive.google.com/file/d/abc123",
    "isLate": false,
    "createdAt": "2025-04-24T08:30:00.000Z"
  }
}
```

---

#### GET `/all-submissions`

Returns all submissions across all homeworks. Teacher only.

**Headers:** `Authorization: Bearer <teacher_token>`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "sub789",
      "student": { "name": "Ravi Kumar", "email": "ravi@example.com" },
      "homework": { "title": "Chapter 5 Questions" },
      "textAnswer": "The answer is 42.",
      "attachedFile": "https://drive.google.com/...",
      "marks": null,
      "feedback": null,
      "isLate": false
    }
  ]
}
```

---

#### POST `/create-result/:homeworkId`

Grade a student's submission.

**Headers:** `Authorization: Bearer <teacher_token>`

**Request Body:**

```json
{
  "marks": 18,
  "feedback": "Good effort! Work on your explanation."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Result saved successfully",
  "data": {
    "marks": 18,
    "feedback": "Good effort! Work on your explanation."
  }
}
```

---

#### GET `/result/:homeworkId`

Student fetches their own result for a specific homework.

**Headers:** `Authorization: Bearer <student_token>`

**Response (graded):**

```json
{
  "success": true,
  "message": "Result fetched successfully",
  "data": {
    "student": { "name": "Ravi Kumar", "email": "ravi@example.com" },
    "homework": { "title": "Chapter 5 Questions", "description": "..." },
    "textAnswer": "The answer is 42.",
    "attachedFile": "https://drive.google.com/...",
    "isGraded": true,
    "marks": 18,
    "feedback": "Good effort!",
    "isLate": false,
    "submittedAt": "2025-04-24T08:30:00.000Z"
  }
}
```

**Response (not graded yet):**

```json
{
  "success": true,
  "message": "Result not declared yet",
  "data": null
}
```

---

## 🚦 Homework Status Types

| Status      | Meaning                                  |
| ----------- | ---------------------------------------- |
| `published` | Visible and open for submission          |
| `draft`     | Created but not yet released to students |
| `closed`    | Deadline passed, no more submissions     |

---

## ⚠️ Common Errors

| Status Code | Message                                           | Reason                                          |
| ----------- | ------------------------------------------------- | ----------------------------------------------- |
| 400         | `"Please provide a text answer or attach a file"` | Both `textAnswer` and `attachedFile` are empty  |
| 401         | `"Unauthorized"`                                  | Token missing or expired                        |
| 403         | `"Access denied"`                                 | Wrong role (e.g. student hitting teacher route) |
| 404         | `"Homework not found"`                            | Invalid `homeworkId`                            |
| 500         | `"Something went wrong"`                          | Internal server error                           |

---

## 📌 Important Notes

- `attachedFile` accepts a **URL string** only (Google Drive, YouTube, etc.) — not an actual binary file upload
- A student can submit **text only**, **link only**, or **both** — but at least one is required
- `marks: 0` is a valid score — the system correctly distinguishes between "not graded" (`null`) and "scored zero" (`0`)
- JWT token must be sent in every protected request via the `Authorization: Bearer` header

---

## 🙋 Author

Built with ❤️ by [Ritesh Mishra](https://riteshmishra.online) — contributions and feedback welcome!
