const mongoose = require("mongoose");
const schema = mongoose.Schema;

const sector_schema = new schema({
    name:    { type: String, required: true, unique: true, uppercase: true },
    value:   { type: Number, required: true },
    percent: { type: Number, required: true }
});

const gas_schema = new schema({
    name:          { type: String, required: true, unique: true },
    code:          { type: String, required: true, unique: true, uppercase: true },
    total_value:   { type: Number, required: true },
    total_percent: { type: Number, required: true},
    sectors: [ sector_schema ]
});

module.exports = mongoose.model("Gas", gas_schema);