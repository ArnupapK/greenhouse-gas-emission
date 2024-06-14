const fs = require('fs');
const path = require("path");
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Country = require('../models/country');  
const { Emission, Gas, Sector } = require("../models/emission");
const connect_db = require("../config/db");

const csv_path = path.join(__dirname, "data", "data.csv");
const parse_config_path = path.join(__dirname, "config.json"); 
const config = JSON.parse(fs.readFileSync(parse_config_path, "utf8"));

// Parse the series code from the data row
const parse_series_code = (data) => {
    const { Gases: gas_types, Sectors: sector_types } = config;
    const series_code = data["Series Code"];
    const code_parts = series_code.split(".");

    let code_type = code_parts[code_parts.length - 1];
    code_type = (code_type == "CE") ? code_parts[code_parts.length - 2] : code_type;

    let gas_type;
    let sector_type;
    if (code_parts[1] === "ATM") {
        gas_type = gas_types[code_parts[2]];
        sector_type = sector_types[code_parts[3]];
    } else {
        gas_type = gas_types[code_parts[1]];
        sector_type = sector_types[code_parts[2]];
    }

    sector_type = (sector_type === code_type) ? "" : sector_type;

    return { series_code, gas_type, sector_type, code_type };
};

// Process each row of data
const process_row = async (row, available_years) => {
    const { "Country Name": country_name, "Country Code": country_code, "Series Name": series_name, "Series Code": series_code } = row;

    if (!country_name || !country_code || !series_name || !series_code) {
        return; // Skip invalid rows
    }

    let country = await Country.findOne({ code: country_code });
    if (!country) {
        country = new Country({ name: country_name, code: country_code });
        await country.save();
    }

    const { gas_type, sector_type, code_type } = parse_series_code(row);

    for (const { header, year } of available_years) {
        const value = row[header];
        let emission = await Emission.findOne({ country: country._id, year }) || new Emission({
            country: country._id,
            year,
            total_value: 0,
            percentage_from_1990: "NA",
            gases: []
        });

        if (gas_type === "GHG") {
            if (code_type === "KT") {
                emission.total_value = value;
            } else if (code_type === "ZG") {
                emission.percentage_from_1990 = value;
            }
        } else {
            let gas = emission.gases.find(g => g.name === gas_type) || new Gas({
                name: gas_type,
                total_value: 0,
                percentage_from_1990: "NA",
                sectors: []
            });

            if (!emission.gases.includes(gas)) {
                emission.gases.push(gas);
            }

            if (sector_type) {
                let sector = gas.sectors.find(s => s.name === sector_type) || new Sector({
                    name: sector_type,
                    value: 0,
                    percentage: 0
                });

                if (!gas.sectors.includes(sector)) {
                    gas.sectors.push(sector);
                }

                if (code_type === "KT") {
                    sector.value = value;
                } else if (code_type === "ZS") {
                    sector.percentage = value;
                }
            } else if (code_type === "KT") {
                gas.total_value = value;
            } else if (code_type === "ZG") {
                gas.percentage_from_1990 = value;
            }
        }
        
        await emission.save();
    }
};

// Process the CSV data
const process_data = async (data) => {
    const available_years = Object.keys(data[0]).filter(header => !isNaN(header.split(" ")[0])).map(header => ({
        header,
        year: parseInt(header.split(" ")[0])
    }));

    for (const row of data) {
        await process_row(row, available_years);
    }

    console.log("Processing complete");
    process.exit(0);
};

// Read and process the CSV file
const read_csv = async (csv_path) => {
    const data = [];
    fs.createReadStream(csv_path)
        .pipe(csv())
        .on('data', (row) => data.push(row))
        .on('end', () => process_data(data));
};

// Connect to the database and start processing
const start = async () => {
    try {
        await connect_db();
        await read_csv(csv_path);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

start();
