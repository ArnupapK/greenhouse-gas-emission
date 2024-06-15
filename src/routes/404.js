const express = require("express");
const Router = express.Router();

Router.use((req, res, next) => {
    res.status(404).json({ message: "Resource not found." });
})

module.exports = Router;