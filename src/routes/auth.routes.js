const express = require("express");
const router = express.Router();

const { send_otp, sign_up, login, getUserDetails, getStudents } = require("../controllers/auth.controller");
const { auth, isTeacher, isStudent } = require("../middlewares/auth");

router.post("/sign-up", sign_up);
router.post("/log-in", login);
router.get("/get-user-details", auth, getUserDetails);
router.get("/students", getStudents); // get all students

module.exports = router