const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const HomeworkModel = require("../models/Homework.model");
const UserModel = require("../models/User.model");
const submitModel = require("../models/submit.model");

// create homework
exports.createHomework = async (req, res, next) => {
    try {
        console.log("req.bod", req.body)

        let {
            title,
            description,
            subject,
            students,
            dueDate,
            status
        } = req.body;

        // check user
        const { userId } = req.user;
        const user = await UserModel.findById(userId);

        if (!user)
            return next(new AppError("User not found", 404));

        // validaiton check
        if (!title || !description || !subject || !dueDate) {
            return next(new AppError("All fields required", 400));
        }

        // sanitizaiton
        title = title.toString().trim();
        description = description.toString().trim();
        subject = subject.toString().trim().toLowerCase();

        const validSubjects = ["hindi", "english", "math", "computer"];

        if (!validSubjects.includes(subject)) {
            return next(new AppError("Invalid subject name", 400));
        }

        // status 
        const validStatus = ["draft", "published", "closed"]

        status = status
            ? status.toString().toLowerCase().trim()
            : "draft";

        if (!validStatus.includes(status))
            return next(new AppError("Invalid Homework status", 400));

        // student
        if (students && !Array.isArray(students)) {
            students = [students];
        }

        students = [...new Set(
            students
                .map(student => student.toString().trim())
                .filter(s => mongoose.Types.ObjectId.isValid(s))
        )];

        if (students.length < 1)
            return next(new AppError("At least one student is required", 400));

        if (new Date(dueDate).getTime() <= Date.now()) {
            return next(new AppError("Due date must be in the future", 400));
        }

        // creating homework in db
        const homework = await HomeworkModel.create({
            title,
            description,
            subject,
            teacher: user?._id,
            students,
            dueDate,
            status,
        });

        return res.status(201).json({
            success: true,
            message: "Homework created",
            homework,
        });
    } catch (err) {
        console.log("Error while creating homework", err)
        return next(new AppError(err.message, 500));
    }
};

// update homework
exports.updateHomework = async (req, res, next) => {
    try {
        let { title, description, subject, students, dueDate, status, homeworkId } = req.body;

        const { userId } = req.user;
        const user = await UserModel.findById(userId);

        // checkcs
        if (!homeworkId)
            return next(new AppError("homework ID is required", 400));

        if (!mongoose.Types.ObjectId.isValid(homeworkId))
            return next(new AppError("Invalid homework ID", 409));

        if (!user)
            return next(new AppError("User not found", 404));

        // find homework
        const homework = await HomeworkModel.findById(homeworkId);

        if (!homework)
            return next(new AppError("Homework not found", 404));

        if (homework.teacher.toString() !== userId)
            return next(new AppError("Only Author can change in the doc", 400))

        // Title
        if (title) {
            title = title.toString().trim();
            homework.title = title
        }

        // Description
        if (description) {
            description = description.toString().trim();
            homework.description = description
        }

        // subject
        if (subject) {
            const validSubjects = ["hindi", "english", "math", "computer"]
            subject = subject.toString().trim().toLowerCase();
            if (!validSubjects.includes(subject))
                return next(new AppError("Invalid subject name", 400));
            homework.subject = subject;
        }


        // Students
        if (students) {

            students = Array.isArray(students)
                ? [...new Set(
                    students
                        .map(s => s?.toString().trim())
                        .filter(s => mongoose.Types.ObjectId.isValid(s))
                )]
                : [];

            if (students.length < 1)
                return next(new AppError("At least one student are required", 400));

            homework.students = students;
        }


        // due date
        if (dueDate) {
            if (new Date(dueDate).getTime() <= Date.now())
                return next(new AppError("Due date must be in the future", 400));

            homework.dueDate = dueDate;
        }


        // status 
        if (status) {
            const validStatus = ["draft", "published", "closed"]

            status = status
                ? status.toString().toLowerCase().trim()
                : "draft";

            if (!validStatus.includes(status))
                return next(new AppError("Invalid Homework status", 400));

            homework.status = status;
        }

        // save the document
        await homework.save();

        return res.status(200).json({
            success: true,
            message: "homework updated sucessfully",
            homework,
        })
    } catch (err) {
        console.log("Error while updating homework", err);
        return next(new AppError(err.message, 500))
    }
}

// delete homework
exports.deleteHomework = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const { homeworkId } = req?.params;

        if (!homeworkId)
            return next(new AppError("Homework id is required", 400));

        if (!mongoose.Types.ObjectId.isValid(homeworkId))
            return next(new AppError("Invalid homework id", 409))

        // user check
        const user = await UserModel.findById(userId);
        if (!user)
            return next(new AppError("User not found", 404));

        // homework 
        const homework = await HomeworkModel.findById(homeworkId);
        if (!homework)
            return next(new AppError("Homework not found", 404));

        // author check
        if (homework.teacher.toString() !== userId)
            return next(new AppError("Only auther can delete this homework", 409));

        // delete the homework
        await HomeworkModel.findByIdAndDelete(homeworkId);

        return res.status(200).json({
            success: true,
            message: "Homework deleted",
        })

    } catch (err) {
        console.log("Error while deleting homework", err);
        return next(new AppError(err.message, 500))
    }
}

// get all home works
exports.getHomeworks = async (req, res, next) => {
    try {
        const homeworks = await HomeworkModel.find({});

        const responseMessage = homeworks.length > 0 ? "All homework fetched successfully" : " currently there are no homework";

        return res.status(200).json({
            success: true,
            message: responseMessage,
            data: homeworks
        })
    } catch (err) {
        console.log("Error while fetching homeworks", err);
        return next(new AppError(err.message, 500))
    }
}

// Single homework
exports.getHomework = async (req, res, next) => {
    try {
        const { homeworkId } = req.params;

        if (!homeworkId)
            return next(new AppError("Homework ID is required", 400));
        if (!mongoose.Types.ObjectId.isValid(homeworkId))
            return next(new AppError("Invalid Homework Id", 409));

        // Fetch homework
        const homework = await HomeworkModel
            .findById(homeworkId)
            .populate("students")
            .populate("teacher", "name email image")
            .populate("submissions");

        if (!homework)
            return next(new AppError("Homework not found", 404));

        return res.status(200).json({
            success: true,
            message: "homework feched successfully",
            data: homework
        })
    } catch (err) {
        console.log("Error while fetching homework", err);
        return next(new AppError(err.message, 500));
    }
}


