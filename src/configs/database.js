const mongoose = require("mongoose");
require("dotenv").config();

const DATABASE_URL = process.env.DATABASE_URL;


const dbconnect = async () => {
    try {
        await mongoose.connect(DATABASE_URL)
            .then(() => console.log("Databse connected successfully"))
    } catch (err) {
        console.log("Error while connecting whit database", err);
        process.exit(1)
    }
}

module.exports = dbconnect