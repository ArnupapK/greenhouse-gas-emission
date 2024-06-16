const fs = require("fs");
const path = require("path");
const config_path = path.join(__dirname, "..", "config", "config.json");
const { Gases, Sectors } = JSON.parse(fs.readFileSync(config_path, "utf-8"));

const Country = require("../models/country");
const { Emission, Gas, Sector } = require("../models/emission");

const GetEmissionByCountryAndYear = async (req, res) => {
    const { "country": reqCountry, "year": reqYear } = req.query;

    if (!reqCountry || !reqYear) {
        return res.status(400).json({ message: "country and year are required." });
    }

    if (isNaN(reqYear)) {
        return res.status(400).json({ message: "year must be number." });
    }

    try {
        const country = await Country.findOne({
            $or: [ { name: reqCountry }, { code: reqCountry } ]
        });

        if (!country) {
            return res.status(404).json({ message: "Country is not found." });
        }

        const emission = await Emission.findOne({ country: country._id, year: reqYear });
        
        if (!emission) {
            return res.status(400).json({ message: `Emission is not found for '${reqCountry}' and '${reqYear}'.` });
        }

        if (!emission.total_value) {
            return res.status(404).json({ message: `No emission data found for '${reqCountry}' and '${reqYear}.'` });
        }

        res.status(200).json({ value: emission.total_value });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const GetEmissionBySector = async (req, res) => {
    const { "country": reqCountry, "year": reqYear, "gas": reqGas } = req.query;
    let returnSectors = [];

    if (!reqCountry || !reqYear) {
        return res.status(400).json({ message: "country and year are required." });
    }

    if (isNaN(reqYear)) {
        return res.status(400).json({ message: "year must be number." });
    }

    try {
        const country = await Country.findOne({
            $or: [ { name: reqCountry }, { code: reqCountry } ]
        });
        
        if (!country) {
            return res.status(404).json({ message: "Country is not found." });
        }

        const emission = await Emission.findOne({ country: country._id, year: reqYear });

        if (!emission) {
            return res.status(404).json({ message: `Emission is not found for ${reqCountry} and ${reqYear}.` });
        }

        if (!emission.gases) {
            return res.status(404).json({ message: "No emission data for sectors." });
        }

        if (reqGas) {
            const sectors = Object.values(emission.gases)
                .filter(g => g.code === reqGas)
                .flatMap(g => g.sectors)
                .map(sector => ({
                    name: sector.name,
                    code: sector.code,
                    value: sector.value
                })
            )

            returnSectors = sectors;
        } else {
            const sectorMap = new Map();
            emission.gases.forEach(gas => {
                gas.sectors.forEach(sector => {
                    const sectorCode = sector.code;
                    const sectorValue = sector.value === null ? 0 : sector.value;
                    if (sectorMap.has(sectorCode)) {
                        sectorMap.get(sectorCode).value += sectorValue;
                    } else {
                        sectorMap.set(sectorCode, {
                            name: sector.name,
                            code: sector.code,
                            value: sectorValue
                        });
                    }
                })
            });

            returnSectors = Array.from(sectorMap.values());
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

    if (returnSectors.length > 0) {
        res.status(200).json({ sectors: returnSectors });
    } else {
        res.status(404).json({ message: (reqGas) ? `The gas with code '${reqGas}' is not found in database. Please check the code and try again.` : "No sector data found." });
    }
};

const GetEmissionTrendByCountry = async (req, res) => {
    const { "country": reqCountry } = req.query;

    if (!reqCountry) {
        return res.status(400).json({ message: "country are required." });
    }

    try {
        const country = await Country.findOne({
            $or: [ { name: reqCountry }, { code: reqCountry } ]
        });

        if (!country) {
            return res.status(404).json({ message: "Country is not found." });
        }

        const emission = await Emission.find({ country: country._id });

        if(!emission) {
            return res.status(404).json({ message: `Emission data is not found for '${reqCountry}'.` });
        }

        const result = emission.map(e => ({
            year: e.year,
            percentage: e.percentage_from_1990
        }))

        res.status(200).json({ trends: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const CreateEmission = async (req, res) => {
    const { "country": newCountry, "year": newYear, "total_value": newTotalValue, "percentage_from_1990": newPercentageFrom1990, "gases": newGases } = req.body;

    if (!newCountry.name || !newCountry.code || !newYear) {
        return res.status(400).json({ message: "country name, country code and year are required." });
    }

    if (isNaN(newYear)) {
        return res.status(400).json({ message: "year must be number." });
    }

    try {
        const country = await Country.findOne({ name: newCountry.name, code: newCountry.code });

        if (!country) {
            return res.status(404).json({ message: "Country is not found." });
        }

        let emission = await Emission.findOne({ country: country._id, newYear });

        if (!emission) {
            emission = new Emission({
                country: country,
                year: newYear,
                total_value: newTotalValue,
                percentage_from_1990: newPercentageFrom1990,
                gases: []
            });
        } else {
            emission.total_value =  newTotalValue || emission.total_value;
            emission.percentage_from_1990 = newPercentageFrom1990 || emission.percentage_from_1990;
        }

        for (let newGas of newGases) {
            if (!newGas.name || !newGas.code) {
                return res.status(400).json({ message: "Gas name and code are required, when adding a new gas." });
            }

            if (newGas.code.length !== 3 || newGas.code !== newGas.code.toUpperCase()) {
                return res.status(400).json({ message: "Gas code must be exactly 3 characters long and uppercase." });
            }

            const gasConfig = Object.values(Gases).find(g => g.code === newGas.code);

            if (!gasConfig) {
                return res.status(404).json({ message: `gas '${newGas.code}' is not available in the gas list.` });
            }

            let gas = emission.gases.find(g => g.code === newGas.code);

            if (!gas) {
                gas = Gas({
                    name: gasConfig.name,
                    code: newGas.code,
                    total_value: newGas.total_value,
                    percentage_from_1990: newGas.percentage_from_1990,
                    sectors: []
                });
                emission.gases.push(gas);
            } else {   
                gas.name = gasConfig.name;
                gas.total_value = newGas.total_value || gas.total_value;
                gas.percentage_from_1990 = newGas.percentage_from_1990 || gas.percentage_from_1990;
            }

            if (newGas.sectors) {
                for (let newSector of newGas.sectors.values()) {
                    if (!newSector.name || !newSector.code) {
                        return res.status(400).json({ message: "Sector name and code are required, when adding a new sector." });
                    }

                    if (newSector.code !== newSector.code.toUpperCase()) {
                        return res.status(400).json({ message: "Sector code must be uppercase." });
                    }

                    const sectorConfigName = Sectors[newSector.code];

                    if (!sectorConfigName) {
                        return res.status(404).json({ message: `sector '${newSector.code}' is not available in the sector list.` });
                    }

                    let sector = gas.sectors.find(s => s.code === newSector.code);
                    
                    if (!sector) {
                        sector = new Sector({
                            name: sectorConfigName,
                            code: newSector.code,
                            value: newSector.value,
                            percentage: newSector.percentage
                        });
                        gas.sectors.push(sector);
                    } else {
                        sector.name = sectorConfigName;
                        sector.value = newSector.value || sector.value;
                        sector.percentage = newSector.percentage || sector.percentage;
                    }

                    gas.sectors = gas.sectors.map(s => s.code === newSector.code ? sector : s);
                }
            }

            emission.gases = emission.gases.map(g => g.code === newGas.code ? gas : g);
        }

        await emission.save();

        // const response = await emission.populate("country").transform((doc, ret) => {
        //     delete ret._id;
        //     delete ret.__v;
        //     delete ret.country._id;
        //     delete ret.__v;
        //     ret.gases.forEach(gas => {
        //         delete gas._id;
        //         gas.sectors.forEach(sector => {
        //             delete sector._id;
        //         });
        //     });
        // });

        res.status(201).json({ message: await emission.populate("country") });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.GetEmissionByCountryAndYear = GetEmissionByCountryAndYear;
module.exports.GetEmissionBySector = GetEmissionBySector;
module.exports.GetEmissionTrendByCountry = GetEmissionTrendByCountry;
module.exports.CreateEmission = CreateEmission;