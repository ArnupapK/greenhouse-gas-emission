const Country = require("../models/country");

const GetAllCountries = async (req, res) => {
    try {
        const countries = await Country.find();

        if (countries.length === 0) {
            return res.status(404).json({ message: "No Countries in database." });
        }

        const returnCountries = countries.map(c => ({
            name: c.name,
            code: c.code
        }));

        res.status(200).json(returnCountries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const CreateCountry = async (req, res) => {
    const { name, code } = req.body;

    if (!name || !code) {
        return res.status(400).json({ message: "Country name and code are required." });
    }

    if (code.length !== 3 || code !== code.toUpperCase()) {
        return res.status(400).json({ message: "Country code must be exactly 3 characters long and uppercase." });
    }

    try {
        const country = await Country.findOne({ name: name, code: code }) || new Country({ name, code });
        await country.save();
        res.status(201).json(country);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.GetAllCountries = GetAllCountries;
module.exports.CreateCountry = CreateCountry;