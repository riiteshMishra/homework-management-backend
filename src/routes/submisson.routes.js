const express = require("express");
const { auth, isTeacher, isStudent } = require("../middlewares/auth");
const { submitHomework, getStudentResult, createResult, getAllSubmissons } = require("../controllers/submit.controller");
const router = express.Router();

// student homework submit krega
router.post("/submit", auth, isStudent, submitHomework);

// teacher ke paas jayega
router.get("/all-submissions", auth, isTeacher, getAllSubmissons)

// teacher dekhneke baad result banayega
router.post("/create-result/:homeworkId", auth, isTeacher, createResult)

// student submission me id dega or apna result lega
router.get("/result/:homeworkId", auth, isStudent, getStudentResult)


module.exports = router