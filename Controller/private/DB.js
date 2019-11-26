const mysql = require('mysql2')
const config = require('../../Config/db.json')
let pool = mysql.createPool(config).promise()
const debug = true // 是否打開sql debug模式

// 优雅async与await
class DB {
    // 基本sql用法
    static async query(sql,opts){
        try{
            let [rows, fields] = await pool.query(sql,opts)
            return rows
        }catch(e){
            if(debug) throw e
            else return null
        }
    }

    // 注意用戶權限
    // list需要給出權限user對象
    static async list(table,user){
        if(!user.sid) return []
        try{
            let [rows, fields] = await pool.query(`select * from ${table} where sid=?`,[user.sid])
            return rows
        }catch(e){
            if(debug) throw e
            else return []
        }
    }

    // insert為強制使用user中sid，故不需要檢查權限
    static async insert(table,data){
        try{
            let res = await pool.query(`insert into ${table} set ?`,data)
            return res[0]['insertId']
        }catch(e){
            if(debug) throw e
            else return null
        }
    }

    // 刪除指定行，confirm表示是否真實true刪除或者虛擬false刪除
    // delete需要給出權限user對象
    static async delete(table,id,user,confirm=false){
        if(!user.sid) return 0
        try{
            let res = await pool.query(`delete from ${table} where id=? and sid=?`, [id,user.sid])
            return res[0]['affectedRows']
        }catch(e){
            if(debug) throw e
            else return null
        }
    }

    //事务
    static async transaction(){
        try{
            const conn = await pool.getConnection() //獲得連接
            await conn.beginTransaction() //開啟事務
            return conn
        } catch(e) {
            // 事務一定要拋出異常
            throw e
        }
    }
}
module.exports=DB
