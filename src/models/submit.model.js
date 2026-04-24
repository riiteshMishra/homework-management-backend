const mongoose = require("mongoose");


const submissionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER_MODEL",
        required: true,
    },
    homework: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Homework",
        required: true
    },
    textAnswer: {
        type: String,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
    attachedLink: {
        type: String,
        trim: true
    },
    marks: {
        type: Number,
        default: 0,
    },
    feedback: {
        type: String,
    },
    isLate: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model("Submission", submissionSchema);
