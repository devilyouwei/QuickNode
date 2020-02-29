const mysql = require('mysql2')
const config = require('../../Config/db.json')
const pool = mysql.createPool(config).promise()
const debug = require('../../Config/web.json').debug_sql // 是否打開sql debug模式

// 优雅async与await
class DB {
    // 基本sql用法
    static async query(sql, opts) {
        try {
            let [rows] = await pool.query(sql, opts)
            return rows
        } catch (e) {
            if (debug) throw e
            else return null
        }
    }

    //事务
    static async transaction() {
        try {
            const conn = await pool.getConnection() //獲得連接
            await conn.beginTransaction() //開啟事務
            return conn
        } catch (e) {
            // 事務一定要拋出異常
            throw e
        }
    }
}
module.exports = DB
