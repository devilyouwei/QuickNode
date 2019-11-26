const db = require('./private/DB.js')
const $ = require('./private/Public.js')
const trim = require('trim')

const PID = 2 // 廚師職位ID
class Cooker{
    static async orderList(req,res){
        let user = await $.auth(req.body.user)
        if(!user || user.pid!=PID) return res.json({status:-1,msg:'登錄權限錯誤'})
        let data = await db.query('select * from orders_desk where endtime=0 and sid=? order by createtime asc',[user.sid])
        return res.json({status:1,data:data,msg:'全部列出'})
    }
}
module.exports=Cooker
