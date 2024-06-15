const mongoose = require("mongoose");

const ConnectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
    } catch (error) {
        console.error(`Failed to connect to [${process.env.DATABASE_URL}]: ${error.message}`);
        process.exit(1);
    }
};

const DeleteDB = async () => {
    try {
        await ConnectDB();
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    } catch (error) {
        console.error(`Failed to delete database from [${process.env.DATABASE_URL}]: ${error.message}`);
        process.exit(1)
    }
};

mongoose.connection.once("open", () => {
    console.log(`Connected to: [${process.env.DATABASE_URL}]`);
});

module.exports.ConnectDB = ConnectDB;
module.exports.DeleteDB = DeleteDB;