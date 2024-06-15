const fs = require("fs");
const path = require("path");
const config_path = path.join(__dirname, "..", "data_source", "config.json");
const { Gases, Sectors } = JSON.parse(fs.readFileSync(config_path, "utf-8"));

const Country = require("../models/country");
const { Emission, Gas, Sector } = require("../models/emission");

const GetEmissionByCountryAndYear = async (req, res) => {
    const { "country": reqCountry, "year": reqYear } = req.query;

    if (!reqCountry || !reqYear) {
        res.status(400).json({ message: "country and year are required." });
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
            return res.status(400).json({ message: `Emission is not found for ${reqCountry} and ${reqYear}.` });
        }

        res.status(200).json({ message: emission.total_value });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const GetEmissionBySector = async (req, res) => {
    const { "country": reqCountry, "year": reqYear, "gas": reqGas } = req.query;

    if (!reqCountry || !reqYear) {
        res.status(400).json({ message: "country and year are required." });
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
            return res.status(400).json({ message: `Emission is not found for ${reqCountry} and ${reqYear}.` });
        }

        if (!emission.gases) {
            return res.status(400).json({ message: "No emission data for sectors." });
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

            console.log(sectors);

            res.status(200).json({ sectors: sectors });
        } else {
            const sectorMap = new Map();
            emission.gases.forEach(gas => {
                gas.sectors.forEach(sector => {
                    const sectorCode = sector.code;
                    if (sectorMap.has(sectorCode)) {
                        sectorMap.get(sectorCode).value += sector.value;
                    } else {
                        sectorMap.set(sectorCode, {
                            name: sector.name,
                            code: sector.code,
                            value: sector.value
                        });
                    }
                })
            });

            res.status(200).json({ message: Array.from(sectorMap.values()) });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const CreateEmission = async (req, res) => {
    const { "country": newCountry, "year": newYear, "total_value": newTotalValue, "percent_from_1990": newPercent1990, "gases": newGases } = req.body;

    try {
        if (isNaN(reqYear)) {
            return res.status(400).json({ message: "year must be number." });
        }

        const country = await Country.findOne({
            $and: [ { name: newCountry.name }, { code: newCountry.code } ]
        });

        if (!country) {
            return res.status(404).json({ message: "Country is not found." });
        }

        const emission = await Emission.findOne({ country: country._id, reqYear });

        if (!emission) {
            new Emission({
                country: country,
                year: newYear,
                total_value: newTotalValue,
                percentage_from_1990: newPercent1990,
                gases: []
            });
        }
        
        if (gases) {
            for (let gas_info of gases) {
                if (gas_info.code.length !== 3 || gas_info.code !== gas_info.code.toUpperCase()) {
                    return res.status(400).json({ message: "code in each gas must be exactly 3 characters long and uppercase." });
                }

                const gas_config = Object.values(Gases).find(g => g.code === gas_info.code);
                console.log(Gas);

                // if (!Gas.includes(gas_info.code)) {
                //     return res.status(400).json({ message: `${gas_info.code} is not in gas list.` });
                // }

                const new_gas = Gas({
                    name: gas_info.name,
                    code: gas_info.code,
                    total_value: gas_info.total_value,
                    percent_from_1990: percent_from_1990,
                    sectors: []
                });

                if (!gas_info.sectors) {
                    continue;
                }
                
                for (let sector_info of gas_info.sectors) {
                    const new_sector = Sector({
                        name: sector_info.name,
                        code: sector_info.code,
                        value: sector_info.value,
                        percentage: sector_info.percentage
                    });

                }

            }
                
            const gas = new Gas({
            });
        }

        // const emission = new Emission({
        //     country: country_info._id,
        //     year: year,
        //     total_value: total_value,
        //     percentage_from_1990: percent_from_1990,
        //     gases: []
        // });

        res.status(201).json({ message: await emission.populate("country") });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.GetEmissionByCountryAndYear = GetEmissionByCountryAndYear;
module.exports.GetEmissionBySector = GetEmissionBySector;
module.exports.CreateEmission = CreateEmission;