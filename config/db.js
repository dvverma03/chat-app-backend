const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { DB_NAME } = require("../constant");

dotenv.config();

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("Error:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
