const $ = require('./private/Public.js')
const db = require('./private/DB.js')
class Index{
    // 後台首页收入数据
    static async income(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        let begin = parseInt(req.body.begin)
        let end = parseInt(req.body.end)
        // 如果未获取到範圍
        if(!begin) begin=0
        if(!end) end=Date.parse(new Date())
        let data = await db.query('select id,pay,title,price,endtime from orders_desk where endtime>=? and endtime<=? and endtime!=0 and sid=?',[begin/1000,end/1000,user.sid])
        return res.json({status:1,data:data,msg:'收入羅列'})
    }

    // 按天列出收入數據(走勢圖)
    static async incomeByDay(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        let begin = parseInt(req.body.begin)
        let end = parseInt(req.body.end)
        // 如果未获取到範圍
        if(!begin) begin=0
        if(!end) end=Date.parse(new Date())
        const sql = 'select DATE_FORMAT(FROM_UNIXTIME(endtime),?) day, endtime, sum(price) price, count(*) orders from orders_desk where endtime>=? and endtime<=? and endtime!=0 and sid=? group by day order by endtime asc'
        let data = await db.query(sql,['%Y-%m-%d',begin/1000,end/1000,user.sid])
        // 只返回數據庫讀取的原始數據，前端自動填充缺損日期，以構成圖
        return res.json({status:1,data:data,msg:'收入列表，按天計算'})
    }

    // 按桌列出收入佔比(餅圖)
    static async incomeByDesk(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        let begin = parseInt(req.body.begin)
        let end = parseInt(req.body.end)
        // 如果未获取到範圍
        if(!begin) begin=0
        if(!end) end=Date.parse(new Date())
        const sql = 'select id,title,IFNULL(orders,0) orders,IFNULL(money,0) money from desk d left join (select did,count(*) orders,sum(price) money from orders where endtime>=? and endtime<=? and endtime!=0 group by did) o on d.id=o.did where sid=? and is_del=0'
        let data = await db.query(sql,[begin/1000,end/1000,user.sid])
        return res.json({status:1,data:data,msg:'按桌劃分'})
    }

    // 不同平台和货币的收入
    static async incomeByPayWay(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        let begin = parseInt(req.body.begin)
        let end = parseInt(req.body.end)
        if(!begin) begin=0
        if(!end) end=Date.parse(new Date())
        const sql = 'select pay from orders_desk where endtime>=? and endtime<=? and endtime!=0 and sid=?'
        let data = await db.query(sql,[begin/1000,end/1000,user.sid])
        return res.json({status:1,data:data,msg:'所有支付方式'})
    }
    // 貨幣
    static async getCurrency(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        let data = await db.query('select * from currency where is_del=0')
        return res.json({status:1,data:data,msg:'列出所有可用貨幣'})
    }
    // 支付方式
    static async getPayWay(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        let data = await db.query('select * from payway where is_del=0')
        return res.json({status:1,data:data,msg:'列出所有可用支付方式'})
    }
}
module.exports=Index
