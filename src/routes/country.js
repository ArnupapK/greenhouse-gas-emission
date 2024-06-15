const express = require("express");
const Router = express.Router();

const { GetAllCountries, CreateCountry } = require("../controllers/country_controller");

/**
 * @swagger
 * /api/countries:
 *   get:
 *     description: Get all countries
 *     parameters:
 *     - name: title
 *       description: title of the book
 *       in: formData
 *       required: true
 *       type: String
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Error
 */
Router.get("/", GetAllCountries);

/**
 * @swagger
 * '/api/user/register':
 *  post:
 *     tags:
 *     - User Controller
 *     summary: Create a user
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - username
 *              - email
 *              - password
 *            properties:
 *              username:
 *                type: string
 *                default: johndoe 
 *              email:
 *                type: string
 *                default: johndoe@mail.com
 *              password:
 *                type: string
 *                default: johnDoe20!@
 *     responses:
 *      201:
 *        description: Created
 *      409:
 *        description: Conflict
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
Router.post("/", CreateCountry);

module.exports = Router;