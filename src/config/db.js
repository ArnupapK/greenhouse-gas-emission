const mongoose = require("mongoose");

const connect_db = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            // useUnifiedTopology: true,
            // useNewUrlParser: true
        });
        console.log(`Connected to: [${process.env.DATABASE_URL}]`);
    } catch(error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    }
};

const delete_db = async () => {
    try {
        await connect_db();
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    } catch (error) {
        console.error("Failed to delete database");
        process.exit(1)
    }
};

module.exports.ConnectDB = connect_db;
module.exports.DeleteDB = delete_db;