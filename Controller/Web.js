const db = require('./private/DB.js')
const $ = require('./private/Public.js')
const trim = require('trim')
const LIMIT_RANK = 10
const LIMIT_ITEM = 9

class Main{
    // list all the cooperation shops
    static async shopList(req,res){
        let keyword = req.body.search
        let search = async (keyword)=>{
            const sql = `
                select id,email,title,time,img
                from shop
                where is_del=0 and is_top=1 ${keyword?"and title LIKE '%"+keyword+"%'":""}
                order by time asc`
            return await db.query(sql)
        }

        let data = await search(keyword)
        /*
        if(data.length==0) {
            keyword = ''
            data = await search(keyword)
        }
        */
        return res.json({status:1,msg:'list all',data:data})
    }

    // list the top 10 food
    static async foodList(req,res){
        let keyword = trim(req.body.search)
        let search = async (keyword)=>{
            const sql = `
                SELECT food.id as id,
                food.title as title,
                food.price as price,
                food.is_effect as is_effect,
                food.thumb as thumb,
                food.sid as sid,
                shop.title as shopname,
                shop.location as address,
                shop.is_del as is_del
                FROM shop
                inner join food
                on shop.id = food.sid
                where is_effect=1 and is_del=0 ${keyword?"and food.title LIKE '%"+keyword+"%'":""}
                order by rand() limit ${LIMIT_ITEM}`
            return await db.query(sql)
        }
        let data = await search(keyword)
        /*
        if(data.length==0) {
            keyword = ''
            data = await search(keyword)
        }
        */
        return res.json({status:1,msg:'list all',data:data})
    }
    // shop home page
    static async home(req,res){
        let sid = parseInt(req.body.id)
        if(!sid) return res.json({status:0,msg:'No shop id'})

        // 獲取店鋪信息
        let data = await db.query('select * from shop where id=? and is_del=0',[sid])
        if(!data || !data.length) return res.json({status:0,msg:'No shop or this shop is invalid!'})

        // 獲取全部的分類和食物
        let data1 = await db.query('select * from type where sid=? order by rank asc',[sid])
        let data2 = await db.query('select * from food where sid=? and is_effect=1 order by rank asc',[sid])
        return res.json({status:1,msg:'list all the data',data:{shop:data, type:data1, food:data2}})
    }
}
module.exports=Main
