const mongoose = require("mongoose");
const UserModel = require("../models/User.model")
const AppError = require("../utils/AppError")

// ban Student
exports.banStudent = async (req, res, next) => {
    try {
        const { studentId } = req.params;

        if (!studentId)
            return next(new AppError("Student Id is required", 400));

        if (!mongoose.Types.ObjectId.isValid(studentId))
            return next(new AppError("Invalid Student ID", 400));

        // find student
        const student = await UserModel.findById(studentId);
        if (!student)
            return next(new AppError("Student not found", 404));

        if (student.accountType !== "student") {
            return next(new AppError("Only students can be banned", 400));
        }

        // toggle status
        let message = "";

        if (student.status === "active") {
            student.status = "banned";
            message = "Student banned successfully";
        } else {
            student.status = "active";
            message = "Student account activated successfully";
        }

        await student.save();

        return res.status(200).json({
            success: true,
            message,
        });

    } catch (err) {
        console.log("Error while banning student", err);
        return next(new AppError(err.message, 500));
    }
};

// delete student
exports.deleteStudents = async (req, res, next) => {
    try {
        let { students } = req.body;

        if (!students)
            return next(new AppError("Student is required", 400));

        // normalize to array
        students = Array.isArray(students) ? students : [students];

        // validate ids
        const validStudents = students
            .map(id => id.toString().trim())
            .filter(id => mongoose.Types.ObjectId.isValid(id));

        if (validStudents.length === 0)
            return next(new AppError("No valid student IDs provided", 400));

        //  single query delete 
        await UserModel.deleteMany({
            _id: { $in: validStudents },
            accountType: "student"
        });

        return res.status(200).json({
            success: true,
            message: `${validStudents.length} student(s) deleted successfully`,
        });

    } catch (err) {
        console.log("Error while deleting student", err);
        return next(new AppError(err.message, 500));
    }
};