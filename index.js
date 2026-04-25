const express = require("express");
const appTheme = require("./src/views/server.start.temp");
const app = express();
require("dotenv").config();
const cors = require("cors");

const dbconnect = require("./src/configs/database");
const errorHandler = require("./src/middlewares/errorHandler");
const cookieParser = require("cookie-parser")

dbconnect();


// Route imports
const authRoutes = require("./src/routes/auth.routes");
const homeworkRoutes = require("./src/routes/homework.routes")
const submissionRoute = require("./src/routes/submisson.routes")
const teacherRoutes = require("./src/routes/teacher.routes");

// MIDDLEWARES
app.use(express.json());
app.use(cookieParser())


// Allowed origin
const allowedOrigins = [
    process.env.FRONTEND_URL,
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);


const PORT = process.env.PORT || 5000;

// Routes
app.get("/", (req, res) => {
    res.send(appTheme);
});

// API creation
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/homework", homeworkRoutes);
app.use("/api/v1/submission", submissionRoute)
app.use("/api/v1/teacher", teacherRoutes)


app.use(errorHandler)
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});