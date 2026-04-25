const AppError = require("../utils/AppError");
const bcrypt = require("bcrypt")
const USER_MODEL = require("../models/User.model")
const jwt = require("jsonwebtoken");
const UserModel = require("../models/User.model");


const isProduction = process.env.NODE_ENV === "production";



// register
exports.sign_up = async (req, res, next) => {
    try {
        let {
            name,
            email,
            password,
            confirmPassword,
            accountType
        } = req.body; // data from client

        // checkes
        if (!name || !email || !password || !confirmPassword || !accountType)
            return next(new AppError("All fields are required", 400));

        // sanitization
        name = name.toString().toLowerCase().trim();
        email = email.toString().toLowerCase().trim();
        password = password.toString().trim();
        confirmPassword = confirmPassword.toString().trim();
        accountType = accountType.toString().toLowerCase().trim();

        // check user already exist
        const userExisted = await USER_MODEL.findOne({ email });

        if (userExisted)
            return next(new AppError("User already exist please to the login page", 400));

        // Account Type Check
        const validAccountType = ["teacher", "student"]
        if (!validAccountType.includes(accountType))
            return next(new AppError("Invalid Account Type", 400));

        // password check
        if (password !== confirmPassword)
            return next(new AppError("Password would be same as confirm password", 400));

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // image
        const image = `https://api.dicebear.com/9.x/adventurer/svg?seed=${name}`

        // create user
        const user = await USER_MODEL.create({
            name,
            email,
            password: hashedPassword,
            accountType,
            image,
        });

        // user payload for jwt
        const payload = {
            userId: user?._id,
            accountType: user?.accountType
        }

        // jwt token generate
        const JWT_SECRET = process.env.JWT_SECRET;

        const token = await jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: "7d" }
        )

        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: token
        });

    } catch (err) {
        console.log("Error while signing up", err);
        return next(new AppError(err))
    }
}

// login
exports.login = async (req, res, next) => {
    try {
        let { email, password } = req.body;

        if (!email || !password)
            return next(new AppError("All fields are required", 400));

        // sanitize
        email = email.toString().toLowerCase().trim();
        password = password.toString().trim();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email))
            return next(new AppError("Invalid email format", 400));

        // user
        const user = await UserModel.findOne({ email }).select("+password");

        if (!user)
            return next(new AppError("Invalid email or password", 401));

        // password
        const isMatched = await bcrypt.compare(password, user.password);

        if (!isMatched)
            return next(new AppError("Invalid email or password", 401));

        // ban check
        if (user.status === "banned")
            return next(new AppError("This account is banned", 403));

        // token
        const payload = {
            userId: user._id,
            accountType: user.accountType,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        // remove password
        user.password = undefined;

        // cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            token,
            user,
        });

    } catch (err) {
        console.log("Error while login", err);
        return next(new AppError(err.message, 500));
    }
};

// get user details
exports.getUserDetails = async (req, res, next) => {
    try {

        if (!req?.user || !req?.user?.userId)
            return next(new AppError("Unauthorized access", 400));

        const { userId } = req.user;

        if (!userId || !req.user)
            return next(new AppError("User ID not found "));

        // find user
        const user = await USER_MODEL.findById(userId)

        if (!user)
            return next(new AppError("User not found", 404));

        return res.status(200).json({
            success: true,
            message: 'User data fetched successfully',
            data: user
        });

    } catch (err) {
        console.log("Error while Fetching user details", err);
        return next(new AppError(err))
    }
}

// get students
exports.getStudents = async (req, res, next) => {
    try {
        const students = await USER_MODEL.find({ accountType: "student" });

        const customMessage = students.length > 0
            ? "All students fetched successfully"
            : "No students found";

        return res.status(200).json({
            success: true,
            message: customMessage,
            data: students,
        })
    } catch (err) {
        console.log("Error while Fetching all students", err);
        return next(new AppError(err.message, 500))
    }
}