const mongoose = require("mongoose");


const homeworkSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
        },

        subject: {
            type: String,
            required: true,
            enum: ["hindi", "english", "math", "computer"]
        },

        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "USER_MODEL",
            required: true,
        },

        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "USER_MODEL",
            },
        ],

        assignedAt: {
            type: Date,
            default: Date.now,
        },

        submissions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Submission"
            }
        ],

        status: {
            type: String,
            enum: ["draft", "published", "closed"],
            default: "draft",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Homework", homeworkSchema);