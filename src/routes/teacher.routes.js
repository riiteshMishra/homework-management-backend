const express = require("express");
const { auth, isTeacher } = require("../middlewares/auth");
const { banStudent, deleteStudents } = require("../controllers/teacher.controller");
const router = express.Router();

// Ban or Unban Students
router.patch("/ban-student/:studentId", auth, isTeacher, banStudent)
router.delete("/delete-students", auth, isTeacher, deleteStudents)


module.exports = router;