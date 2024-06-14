const mongoose = require('mongoose');
const { ConnectDB, DeleteDB } = require("../config/db");

const Country = require('../models/country');
const { Emission, Gas, Sector } = require("../models/emission");

const fs = require('fs');
const path = require("path");
const csv = require('csv-parser');

const csv_path = path.join(__dirname, "data", "data.csv");
const config_path = path.join(__dirname, "config.json"); 
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

        console.log("Adding:", series_code, series_name, JSON.stringify(await emission.populate("country"), null, 2));
        await emission.save();
    }

    return success;
};

const ProcessData = async (data) => {
    const available_years = Object.keys(data[0]).filter(header => !isNaN(header.split(" ")[0])).map(header => ({
        header: header,
        year: parseInt(header.split(" ")[0])
    }));

    const incompletedRow = [];
    for (const row of data) {
        if (!await ProcessRow(row, available_years)) {
            incompletedRow.push(row);
        }
    }

    for (const row of incompletedRow) {
        await ProcessRow(row, available_years);
    }

    console.log("Processing Complete");

    const country = await Country.findOne({ code: "THA" });
    const sample = await Emission.findOne({ country: country._id, year: 1998 });
    if (sample) {
        console.log("Found:", JSON.stringify(await sample.populate("country"), null, 2));
    } else {
        console.log("Not Found");
    }

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
        await DeleteDB();
        await ConnectDB();
        await ReadCSV(csv_path);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB");
});
        
Start();

// EN.ATM.GHGT.ZG       Total greenhouse gasType emissions (% change from 1990)
// EN.ATM.METH.AG.ZS    Agricultural methane emissions (% of total)
// EN.ATM.NOXE.AG.ZS    Agricultural nitrous oxide emissions (% of total)
// EN.ATM.CO2E.KT       CO2 emissions (kt)
// EN.CO2.ETOT.ZS       CO2 emissions from electricity and heat production, total (% of total fuel combustion)
// EN.CO2.MANF.ZS       CO2 emissions from manufacturing industries and construction (% of total fuel combustion)
// EN.CO2.OTHX.ZS       CO2 emissions from other sectors, excluding residential buildings and commercial and public services (% of total fuel combustion)
// EN.CO2.BLDG.ZS       CO2 emissions from residential buildings and commercial and public services (% of total fuel combustion)
// EN.CO2.TRAN.ZS       CO2 emissions from transport (% of total fuel combustion)
// EN.ATM.METH.EG.ZS    Energy related methane emissions (% of total)
// EN.ATM.METH.ZG       Methane emissions (% change from 1990)
// EN.ATM.HFCG.KT.CE    HFC gasType emissions (thousand metric tons of CO2 equivalent)
// EN.ATM.NOXE.EG.ZS    Nitrous oxide emissions in energy sectorType (% of total)
// EN.ATM.GHGT.KT.CE    Total greenhouse gasType emissions (kt of CO2 equivalent)
// EN.ATM.SF6G.KT.CE    SF6 gasType emissions (thousand metric tons of CO2 equivalent)
// EN.ATM.PFCG.KT.CE    PFC gasType emissions (thousand metric tons of CO2 equivalent)
// EN.ATM.NOXE.ZG       Nitrous oxide emissions (% change from 1990)
// EN.ATM.NOXE.KT.CE    Nitrous oxide emissions (thousand metric tons of CO2 equivalent)
// EN.ATM.METH.EG.KT.CE Methane emissions in energy sectorType (thousand metric tons of CO2 equivalent)
// EN.ATM.NOXE.EG.KT.CE Nitrous oxide emissions in energy sectorType (thousand metric tons of CO2 equivalent)
// EN.ATM.METH.KT.CE    Methane emissions (kt of CO2 equivalent)
// EN.ATM.METH.AG.KT.CE Agricultural methane emissions (thousand metric tons of CO2 equivalent)
// EN.ATM.NOXE.AG.KT.CE Agricultural nitrous oxide emissions (thousand metric tons of CO2 equivalent)
