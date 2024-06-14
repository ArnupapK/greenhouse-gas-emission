const mongoose = require("mongoose");
const schema = mongoose.Schema;

const country_schema = new schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true }
});

module.exports = mongoose.model("Country", country_schema);