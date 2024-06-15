const Country = require("../models/country");

const GetAllCountries = async (req, res) => {
    try {
        const countries = await Country.find();
        const countries_info = countries.map(country => ({
            name: country.name,
            code: country.code
        }));
        res.status(200).json(countries_info);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const CreateCountry = async (req, res) => {
    const { name, code } = req.body;

    if (!name || !code) {
        res.status(400).json({ message: "name and code are required." });
    }

    if (code.length !== 3 || code !== code.toUpperCase()) {
        res.status(400).json({ message: "code must be exactly 3 characters long and uppercase." });
    }

    try {
        const country = new Country({ name, code });
        await country.save();
        res.status(201).json(country);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports.GetAllCountries = GetAllCountries;
module.exports.CreateCountry = CreateCountry;