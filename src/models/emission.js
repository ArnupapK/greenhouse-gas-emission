const mongoose = require("mongoose");
const schema = mongoose.Schema;

const sector_schema = new schema({
    code:       { type: String, required: true, uppercase: true },
    name:       { type: String, required: true },
    value:      { type: Number, default: null },
    percentage: { type: Number, default: null }
});

const gas_schema = new schema({
    code:                 { type: String, required: true, uppercase: true },
    name:                 { type: String, required: true },
    total_value:          { type: Number, default: null },
    percentage_from_1990: { type: Number, default: null },
    sectors: [{ type: sector_schema, default: [] }]
});

const emission_schema = new schema({
    country:              { type: schema.Types.ObjectId, ref: "Country", required: true, index: true},
    year:                 { type: Number, required: true, default: null },
    total_value:          { type: Number, default: null },
    percentage_from_1990: { type: Number, default: null },
    gases: [{ type: gas_schema, default: [] }]
});

emission_schema.index({ country: 1, year: 1 });

const Emission = mongoose.model("Emission", emission_schema);
const Gas = mongoose.model("Gas", gas_schema);
const Sector = mongoose.model("Sector", sector_schema);

module.exports = { Emission, Gas, Sector };