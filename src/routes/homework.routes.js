const express = require("express");
const { isTeacher, auth, } = require("../middlewares/auth");
const { createHomework, updateHomework, deleteHomework, getHomeworks, getHomework, } = require("../controllers/homework.controller");

const router = express.Router();


router.post("/create", auth, isTeacher, createHomework);
router.patch("/update", auth, isTeacher, updateHomework);
router.delete("/delete/:homeworkId", auth, isTeacher, deleteHomework);
router.get("/homeworks", getHomeworks) // All homeworks
router.get("/:homeworkId", getHomework) // single student




module.exports = router;