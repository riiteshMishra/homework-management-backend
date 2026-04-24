const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        lowercase: true,
        required: [true, "User name is required"],
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: [true, "Email is required"],

    },
    password: {
        type: String,
        minlength: 6,
        trim: true,
        required: [true, "Password is required"],
        select: false,
    },
    accountType: {
        type: String,
        required: true,
        enum: ["teacher", "student"],
        lowercase: true,
        required: [true, "Account type is required"],
    },
    image: {
        type: String,
        trim: true,
    }
});

module.exports = mongoose.model("USER_MODEL", userSchema);