require('dotenv').config()
const Sequelize = require('sequelize')
const Model = require('./Model')

const { MYSQL_DB, MYSQL_USER, MYSQL_PASS, DB_DIALECT, MYSQL_HOST } = process.env
const db = new Sequelize(MYSQL_DB, MYSQL_USER, MYSQL_PASS, {
    dialect: DB_DIALECT,
    host: MYSQL_HOST,
    pool: { min: 0, max: 5, acquire: 30000, idle: 10000 }
})

function model() {
    const tables = {}
    for (const i in Model) tables[i] = db.define(Model[i].name, Model[i].table, Model[i].options)
    return tables
}

module.exports = model()
