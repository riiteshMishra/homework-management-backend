const AppError = require("../utils/AppError");
const jwt = require("jsonwebtoken");
const ACCOUNT_TYPE = require("../utils/helper");

// authentication
exports.auth = async (req, res, next) => {
    try {
        const token =
            req?.body?.token ||
            req?.cookies?.token ||
            (
                req?.headers?.authorization &&
                    req?.headers?.authorization?.startsWith("Bearer ")
                    ? req?.headers?.authorization?.split(" ")[1]
                    : null

            );


        if (!token)
            return next(new AppError("Token not found", 409));

        const decode = jwt.verify(token, process.env.JWT_SECRET);

        if (!decode)
            return next(new AppError("Token expired or modified", 409));

        // asign
        req.user = decode;
        next()
    } catch (err) {
        console.log("Error while authorization", err);
        return next(new AppError(err))
    }
}

// is Teacher
exports.isTeacher = async (req, res, next) => {
    try {
        // check
        if (!req.user) {
            return next(new AppError("Unauthorized access", 401));
        }

        // compare
        if (req.user.accountType !== ACCOUNT_TYPE.TEACHER) {
            return next(new AppError("Only teachers allowed", 403));
        }
        next()
    } catch (err) {
        console.log("Error while validating Teacher", err);
        return next(new AppError(err))
    }
}


// isStudent
exports.isStudent = async (req, res, next) => {
    try {
        // check
        if (!req.user) {
            return next(new AppError("Unauthorized access", 401));
        }

        // compare
        if (req.user.accountType !== ACCOUNT_TYPE.STUDENT) {
            return next(new AppError("Only students allowed", 403));
        }

        next()
    } catch (err) {
        console.log("Error while validating Student", err);
        return next(new AppError(err))
    }
}