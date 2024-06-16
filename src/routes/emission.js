const express = require("express");
const Router = express.Router();

const {
    GetEmissionByCountryAndYear,
    GetEmissionBySector,
    GetEmissionTrendByCountry,
    CreateEmission
} = require("../controllers/emission_controller");

/**
 * @swagger
 * /api/emission:
 *  get:
 *    tags:
 *    - Emission Controller
 *    summary: Get emission by country and year
 *    parameters:
 *      - name: country
 *        in: query
 *        required: true
 *        schema:
 *          type: string
 *        description: Country name or code
 *      - name: year
 *        in: query
 *        required: true
 *        schema:
 *          type: integer
 *        description: Year
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                value:
 *                  type: number
 *                  example: 1000.5
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
Router.get("/", GetEmissionByCountryAndYear);

/**
 * @swagger
 * /api/emission/sector:
 *  get:
 *    tags:
 *    - Emission Controller
 *    summary: Get emission by sector
 *    parameters:
 *      - name: country
 *        in: query
 *        required: true
 *        schema:
 *          type: string
 *        description: Country name or code
 *      - name: year
 *        in: query
 *        required: true
 *        schema:
 *          type: integer
 *        description: Year
 *      - name: gas
 *        in: query
 *        required: false
 *        schema:
 *          type: string
 *        description: Gas code
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                sectors:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      name:
 *                        type: string
 *                        example: "Transportation"
 *                      code:
 *                        type: string
 *                        example: "TRANS"
 *                      value:
 *                        type: number
 *                        example: 300.0
 *                      percentage:
 *                        type: number
 *                        example: 1.5
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
Router.get("/sector", GetEmissionBySector);

/**
 * @swagger
 * /api/emission/trend:
 *  get:
 *    tags:
 *    - Emission Controller
 *    summary: Get emission trend by country
 *    parameters:
 *      - name: country
 *        in: query
 *        required: true
 *        schema:
 *          type: string
 *        description: Country name or code
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                trends:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      year:
 *                        type: integer
 *                        example: 2020
 *                      percentage:
 *                        type: number
 *                        example: 5.0
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
Router.get("/trend", GetEmissionTrendByCountry);

/**
 * @swagger
 * /api/emission:
 *  post:
 *    tags:
 *    - Emission Controller
 *    summary: Create a new emission record
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - country
 *              - year
 *            properties:
 *              country:
 *                type: object
 *                properties:
 *                  name:
 *                    type: string
 *                    example: "United States"
 *                  code:
 *                    type: string
 *                    example: "USA"
 *              year:
 *                type: integer
 *                example: 2020
 *              total_value:
 *                type: number
 *                example: 1000.5
 *              percentage_from_1990:
 *                type: number
 *                example: 5.0
 *              gases:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    name:
 *                      type: string
 *                      example: "Carbon Dioxide"
 *                    code:
 *                      type: string
 *                      example: "CO2"
 *                    total_value:
 *                      type: number
 *                      example: 500.5
 *                    percentage_from_1990:
 *                      type: number
 *                      example: 2.5
 *                    sectors:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          name:
 *                            type: string
 *                            example: "Transportation"
 *                          code:
 *                            type: string
 *                            example: "TRANS"
 *                          value:
 *                            type: number
 *                            example: 300.0
 *                          percentage:
 *                            type: number
 *                            example: 1.5
 *    responses:
 *      201:
 *        description: Created
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: object
 *                  properties:
 *                    country:
 *                      type: object
 *                      properties:
 *                        _id:
 *                          type: string
 *                          example: "666e584a18f6de5d775cb46c"
 *                        name:
 *                          type: string
 *                          example: "Thailand"
 *                        code:
 *                          type: string
 *                          example: "THA"
 *                        __v:
 *                          type: integer
 *                          example: 0
 *                    year:
 *                      type: integer
 *                      example: 12345
 *                    total_value:
 *                      type: number
 *                      example: 1235845.45845
 *                    percentage_from_1990:
 *                      type: number
 *                      example: null
 *                    gases:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          code:
 *                            type: string
 *                            example: "CO2"
 *                          name:
 *                            type: string
 *                            example: "Carbon Dioxide"
 *                          total_value:
 *                            type: number
 *                            example: 0
 *                          percentage_from_1990:
 *                            type: number
 *                            example: null
 *                          sectors:
 *                            type: array
 *                            items:
 *                              type: object
 *                              properties:
 *                                code:
 *                                  type: string
 *                                  example: "AG"
 *                                name:
 *                                  type: string
 *                                  example: "Agricultural"
 *                                value:
 *                                  type: number
 *                                  example: 0
 *                                percentage:
 *                                  type: number
 *                                  example: null
 *                                _id:
 *                                  type: string
 *                                  example: "666e60041850d37ff78889e8"
 *                          _id:
 *                            type: string
 *                            example: "666e60041850d37ff78889e6"
 *                    _id:
 *                      type: string
 *                      example: "666e60041850d37ff78889e5"
 *                    __v:
 *                      type: integer
 *                      example: 0
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
Router.post("/", CreateEmission);

module.exports = Router;