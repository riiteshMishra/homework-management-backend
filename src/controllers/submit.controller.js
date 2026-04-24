const HomeworkModel = require("../models/Homework.model");
const submitModel = require("../models/submit.model");
const UserModel = require("../models/User.model");
const AppError = require("../utils/AppError")

// submit ke baad edit nhi kr skte
exports.submitHomework = async (req, res, next) => {
    try {
        // marks,feedback,isLate is for Teacher only
        let { textAnswer, homeworkId, attachedLink } = req.body;
        const { userId } = req.user;

        if (!textAnswer || !attachedLink || !homeworkId)
            return next(new AppError("All fields are requried"));

        // user check
        const user = await UserModel.findById(userId);
        if (!user)
            return next(new AppError("User not found", 404));


        // homework 
        const homework = await HomeworkModel.findById(homeworkId);
        if (!homework)
            return next(new AppError("Homework not found", 404));

        // sanitization
        textAnswer = textAnswer.toString().trim();
        attachedLink = attachedLink.toString().trim();


        const aleardeySubmited = await submitModel.findOne({
            homework: homeworkId,
            student: userId,
        });

        if (aleardeySubmited)
            return next(new AppError("You already submited", 409));


        const submited = await submitModel.create({
            textAnswer,
            attachedLink,
            homework: homeworkId,
            student: userId,
        })

        // homework me iska id or student ka id dal do
        homework.submissions.push(submited._id)

        await homework.save();

        return res.status(201).json({
            success: true,
            message: "home work submited",
            data: submited
        })
    } catch (err) {
        console.log("Error while submitting the homework", err)
        return next(new AppError(err.message, 500))
    }
}


// GET ALL SUBMISSONS
exports.getAllSubmissons = async (req, res, next) => {
    try {
        const submissions = await submitModel
            .find({})
            .populate("student", "name email image");

        const message = submissions.length > 0 ? "All submission fetched" : "there are no submissions";

        return res.status(200).json({
            success: true,
            message,
            count: submissions.length,
            data: submissions
        });

    } catch (err) {
        console.log("Error while fetching submissions", err);
        return next(new AppError(err.message, 500));
    }
};


// Check homework
exports.createResult = async (req, res, next) => {
    try {
        const { homeworkId } = req.params;
        let { studentId, marks, feedback, isLate } = req.body;

        if (!studentId || !homeworkId)
            return next(new AppError("All fields are required", 409));

        // find student
        const student = await UserModel.findById(studentId);
        if (!student)
            return next(new AppError("Student not found", 404));

        // find homework
        const homework = await HomeworkModel.findById(homeworkId);
        if (!homework)
            return next(new AppError("Homework not found", 404));

        // submission find
        const submission = await submitModel.findOne({
            student: studentId,
            homework: homeworkId
        });

        if (!submission)
            return next(new AppError("This student is not submited homework", 404));

        // submiision update
        if (marks) {
            marks = marks.toString().trim();
            submission.marks = marks;
        }

        // Feedback
        if (feedback) {
            feedback = feedback.toString().trim();
            submission.feedback = feedback;
        }

        // Is late
        if (typeof isLate !== "undefined") {
            submission.isLate = isLate;
        }

        await submission.save();

        return res.status(200).json({
            success: true,
            message: `Reasult is created for ${student?.name}`
        })
    } catch (err) {
        console.log("Error while creating result", err)
        return next(new AppError(err.message, 500))
    }
}

// STUDENT RESULT
exports.getStudentResult = async (req, res, next) => {
    try {
        const { homeworkId } = req.params;
        const { userId } = req.user;

        const submission = await submitModel
            .findOne({ student: userId, homework: homeworkId })
            .populate("student", "name email image")
            .populate("homework", "title description");

        if (!submission) {
            return res.status(200).json({
                success: true,
                message: "Result not declared yet",
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            message: "Result fetched successfully",
            data: {
                student: submission.student,
                homework: submission.homework,
                textAnswer: submission.textAnswer,
                attachedFile: submission.attachedFile,
                isGraded: submission.marks != null,
                marks: submission.marks ?? null,
                feedback: submission.feedback ?? null,
                isLate: submission.isLate ?? false,
                submittedAt: submission.createdAt
            }
        });

    } catch (err) {
        console.error("Error while fetching result:", err);
        return next(new AppError(err.message, 500));
    }
};