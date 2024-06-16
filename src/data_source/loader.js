const { ConnectDB, DeleteDB } = require("../config/db");

const Country = require('../models/country');
const { Emission, Gas, Sector } = require("../models/emission");

const fs = require('fs');
const path = require("path");
const csv = require('csv-parser');

const csv_path = path.join(__dirname, "data", process.env.DATABASE_FILE || "data.csv");
const config_path = path.join(__dirname, "..", "config", "config.json"); 
const config = JSON.parse(fs.readFileSync(config_path, "utf8"));

const ParseSeriesCode = (data) => {
    const { Gases, Sectors } = config;

    const series_code = data["Series Code"];
    const code_parts = series_code.split(".");

    let codeType = code_parts[code_parts.length - 1];
    codeType = (codeType == "CE") ? code_parts[code_parts.length - 2] : codeType;

    let gasType, sectorType;

    if (code_parts[1] == "ATM") {
        gasType = Gases[code_parts[2]];
        sectorType = { code: code_parts[3], name: Sectors[code_parts[3]] };
    } else {
        gasType = Gases[code_parts[1]];
        sectorType = { code: code_parts[2], name: Sectors[code_parts[2]] };
    }

    if (sectorType.code == codeType) {
        sectorType.name = "";
        sectorType.code = "";
    }

    return { gasType, sectorType, codeType };
};

const ProcessRow = async (row, years) => {
    let success = true;
    const { "Country Name": country_name, "Country Code": country_code, "Series Name": series_name, "Series Code": series_code } = row;

    if (!country_name || !country_code || !series_name || !series_code) {
        return;
    }

    let country = await Country.findOne({ code: country_code });
    if (!country) {
        country = new Country({ name: country_name, code: country_code });
        await country.save();
    }

    const { gasType, sectorType, codeType } = ParseSeriesCode(row);

    for (const { header, year } of years) {
        const value = (row[header] === "NA") ? null : row[header];

        let emission = await Emission.findOne({ country: country._id, year }) || new Emission({
            country: country._id,
            year: year,
            total_value: null,
            percentage_from_1990: null,
            gases: []
        });

        if (gasType.code === "GHG") {
            if (codeType === "KT") {
                emission.total_value = value;
            } else if (codeType === "ZG") {
                emission.percentage_from_1990 = value;
            }
        } else {
            let gas = emission.gases.find(g => g.code === gasType.code);
            if (!gas) {
                gas = new Gas({
                    code: gasType.code,
                    name: gasType.name,
                    total_value: null,
                    percentage_from_1990: null,
                    sectors: []
                });
                emission.gases.push(gas);
            }

            if (sectorType.code) {
                let sector = await gas.sectors.find(s => s.code === sectorType.code);
                if (!sector) {
                    sector = new Sector({
                        code: sectorType.code,
                        name: sectorType.name,
                        value: null,
                        percentage: null
                    });
                    gas.sectors.push(sector);
                }

                if (codeType === "KT") {
                    sector.value = value;
                } else if (codeType === "ZS") {
                    sector.percentage = value;

                    if (!gas.total_value) {
                        success = false;
                    } else {
                        sector.value = value * gas.total_value / 100.0;
                    }
                }

                gas.sectors = gas.sectors.map(s => s.code === sector.code ? sector : s);

            } else if (codeType === "KT") {
                gas.total_value = value;
            } else if (codeType === "ZG") {
                gas.percentage_from_1990 = value;
            }

            emission.gases = emission.gases.map(g => g.code === gas.code ? gas : g);
        }

        await emission.save();
    }

    return success;
};

const ProcessData = async (data) => {
    const available_years = Object.keys(data[0]).filter(header => !isNaN(header.split(" ")[0])).map(header => ({
        header: header,
        year: parseInt(header.split(" ")[0])
    }));

    console.log("This process may take approximately 10 minutes.");
    console.log("Uploading database to MongoDB...");

    const incompletedRow = [];
    for (const row of data) {
        if (!await ProcessRow(row, available_years)) {
            incompletedRow.push(row);
        }
    }

    for (const row of incompletedRow) {
        await ProcessRow(row, available_years);
    }

    console.log("Uploading Complete.");
    process.exit(0);
};

const ReadCSV = async () => {
    const data = [];
    fs.createReadStream(csv_path)
        .pipe(csv())
        .on("data", (row) => data.push(row))
        .on("end", () => ProcessData(data));
};

const Start = async() => {
    try {
        // await DeleteDB();
        await ConnectDB();
        await ReadCSV(csv_path);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};
        
Start();