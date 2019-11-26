const db = require('./private/DB.js');

class Config{
    static async languages(req,res){
        let data = await db.query('select * from languages')
        return res.json({status:1,data:data,msg:'languages'})
    }
    static async index(req,res){
        return res.json({status:1,msg:'......'})
    }
}
module.exports=Config
