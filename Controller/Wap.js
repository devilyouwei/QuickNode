const db = require('./private/DB.js');
const $ = require('./private/Public.js')

class Wap{
    // 登錄功能
    static async oAuthLogin(req,res){
        let opt = parseInt(req.body.opt)
        if(opt==1){// Google
            let checkUrl = `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${req.body.id_token}`
            let user = await $.get(checkUrl)
            if(!user) return res.json({status:0,msg:'Login Error'})
            user = JSON.parse(user)
            // 檢查數據庫
            let row = (await db.query('select id from customer where email=? and opt=?',[user.email,opt]))[0]
            let data = {
                id: null,
                email: user.email,
                avatar: user.picture,
                full_name: user.name,
                first_name: user.given_name,
                last_name: user.family_name,
                locale: user.locale,
                scope: req.body.scope,
                token_type: req.body.token_type,
                id_token: req.body.id_token,
                access_token: req.body.access_token,
                auth_service: req.body.auth_service,
                opt:opt
            }
            if(!row){ // insert new user
                let flag = await db.insert('customer',data)
                if(flag) {
                    data.id = flag
                    return res.json({status:1,msg:'Login Success',data:data})
                }
                else return res.json({status:0,msg:'Fail to login, insert error'})
            }else{ // update user info
                data.id = row.id
                const sql = `update customer set email='${data.email}',
                        avatar='${data.avatar}',
                        full_name='${data.full_name}',
                        first_name='${data.first_name}',
                        last_name='${data.last_name}',
                        locale='${data.locale}',
                        scope='${data.scope}',
                        token_type='${data.token_type}',
                        id_token='${data.id_token}',
                        access_token='${data.access_token}',
                        auth_service='${data.auth_service}' where id=${data.id}`
                let flag = await db.query(sql)
                return res.json({status:1,msg:'Login Success',data:data})
            }
        } else if(opt==2){ // facebook
            let checkUrl = `https://graph.facebook.com/${req.body.userID}?fields=name,email,picture,birthday,hometown&access_token=${req.body.accessToken}`
            let user = await $.get(checkUrl)
            if(!user) return res.json({status:0,msg:'Login Error'})
            user = JSON.parse(user)
            let row = (await db.query('select id from customer where email=? and opt=?',[user.email,opt]))[0]
            let data = {
                id: null,
                email: user.email,
                avatar: user.picture.data.url,
                full_name: user.name,
                first_name: '',
                last_name: '',
                locale: '',
                scope: '',
                token_type: '',
                id_token: '',
                access_token: req.body.accessToken,
                auth_service: 'facebook',
                opt:opt
            }
            if(!row){ // insert new user
                let flag = await db.insert('customer',data)
                if(flag) {
                    data.id = flag
                    return res.json({status:1,msg:'Login Success',data:data})
                }
                else return res.json({status:0,msg:'Fail to login, insert error'})
            }else{ // update user info
                data.id = row.id
                const sql = `update customer set email='${data.email}',
                        avatar='${data.avatar}',
                        full_name='${data.full_name}',
                        first_name='${data.first_name}',
                        last_name='${data.last_name}',
                        locale='${data.locale}',
                        scope='${data.scope}',
                        token_type='${data.token_type}',
                        id_token='${data.id_token}',
                        access_token='${data.access_token}',
                        auth_service='${data.auth_service}' where id=${data.id}`
                let flag = await db.query(sql)
                return res.json({status:1,msg:'Login Success',data:data})
            }
            return res.json({status:1,data:data})
        } else{
            return res.json({status:0,msg:'Invalid login method!'})
        }
    }

    // 訂單詳情，不傳入id，默認返回未完成訂單
    static async showOrder(req,res){
        let user = await $.auth2(req.body.user)
        if(!user) return res.json({status:-1,msg:'No login status'})

        let id = parseInt(req.body.id)
        if(!id){ // 默認檢查和返回未完成訂單
            const sql = 'select id from orders_desk where cid=? and is_del=0 and endtime=0'
            let data = (await db.query(sql, [user.id]))[0]
            if(data) return res.json({status:1,msg:'unfinished order',data:data})
            else return res.json({status:0,msg:'No unfinished order'})
        }
        const sql = 'select * from orders_desk where cid=? and is_del=0 and id=? and endtime=0'
        let data = (await db.query(sql,[user.id,id]))[0]
        if(!data) return res.json({status:0,msg:'Order ended!'})
        return res.json({status:1,data:data,msg:'show order'})
    }

    // 下單
    static async makeOrder(req,res){
        let user = await $.auth2(req.body.user)
        if(!user) return res.json({status:-1,msg:'No login status'})

        // 檢查未完成訂單
        const sql = 'select id from orders_desk where cid=? and is_del=0 and endtime=0'
        let flag = (await db.query(sql, [user.id]))[0]
        if(flag) return res.json({status:0,msg:'unfinished order'})

        // 開始下單
        let did = parseInt(req.body.did) // 餐桌id
        let oid = parseInt(req.body.oid) // 訂單id
        let order = JSON.parse(req.body.order) // 餐品內容json

        // 檢查二維碼
        if(!did) return res.json({status:0,msg:'Scan the QR code!'})
        // 檢查訂單內容是否有
        if(!order || order.length==0) return res.json({status:0,msg:'No order content error!'})

        // 檢查餐桌是否可用
        flag = await db.query('select id from desk where id=? and is_del=0',[did])
        if(!flag || !flag.length) return res.json({status:0,msg:'Desk forbidden!'})

        let price = 0 // 訂單總價
        let num = 0 // 訂單總數
        // 計算價格和總數
        for(let i in order){
            price += order[i].price * parseInt(order[i].count)
            num += parseInt(order[i].count)
            delete order[i]['rank']
            delete order[i]['time']
            delete order[i]['is_effect']
            order[i]['cooked'] = 0
        }
        // 創建訂單
        let data = {
            did:did,
            content:JSON.stringify(order),
            cid:user.id,
            num:num,
            price:price,
            createtime: Date.parse(new Date())/1000, //訂單創建時間
            endtime:0
        }
        flag = await db.insert('orders',data)
        if(flag) return res.json({status:1,msg:'New order created',data:flag})
        else return res.json({status:0,msg:'Error when generating the order!'})
    }


    // 首頁點菜
    static async index(req,res){
        if(!await $.auth2(req.body.user)) return res.json({status:-1,msg:'No login status'})

        // 只需傳入桌號
        let did = parseInt(req.body.did)
        if(!did) return res.json({status:0,msg:'Scan the Qrcode first!'})

        // 獲取餐桌信息
        let data = await db.query('select * from desk where id=? and is_del=0',[did])
        if(!data || !data.length) return res.json({status:0,msg:'Invalid Qrcode!'})
        let sid = data[0]['sid']

        // 獲取店鋪信息
        let data3 = await db.query('select * from shop where id=? and is_del=0',[sid])
        if(!data3 || !data3.length) return res.json({status:0,msg:'No shop or this shop is invalid!'})

        // 獲取全部的分類和食物
        let data1 = await db.query('select * from type where sid=? order by rank asc',[sid])
        let data2 = await db.query('select * from food where sid=? and is_effect=1 order by rank asc',[sid])

        return res.json({status:1,data:{type:data1,food:data2,shop:data3[0],desk:data[0]},msg:'list all'})
    }
}
module.exports=Wap
