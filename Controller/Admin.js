const db = require('./private/DB.js');
const trim = require('trim')
const $ = require('./private/Public.js')
const md5 = require('md5')
const PAGE_SIZE = 10

// 店鋪管理員類
class Admin{
    /*類型部分*/
    // 讀取類型列表
    static async typeList(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        let data = await db.query('select * from type where sid=? order by rank asc',[user.sid])
        return res.json({status:1,data:data,msg:'全部列出'})
    }
    // 保存列表
    static async typeSave(req,res){
        let body = req.body
        let id = parseInt(body.id)
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        if(!id){
            // 新增
            let data={
                title:body.title,
                rank:body.rank,
                time:$.date2stamp(),
                sid:user.sid
            }
            let id = await db.insert('type',data)
            if(id>0) return res.json({status:1,msg:'插入成功'})
            else return res.json({status:0,msg:'插入失敗，數據寫入錯誤'})
        } else {
            //編輯
            let data={
                id:body.id,
                title:body.title,
                rank:body.rank,
                time:$.date2stamp(),
                sid:user.sid
            }
            let flag = (await db.query('update type set title=?,rank=?,time=? where id=? and sid=?',[data.title,data.rank,data.time,data.id,user.sid]))['affectedRows']
            if(flag>0) return res.json({status:1,msg:'編輯成功'})
            else return res.json({status:0,msg:'沒有改變'})
        }
    }

    // 刪除列表
    static async typeDelete(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        let id = parseInt(req.body.id)
        if(id){
            let flag = await db.delete('type',id,user)
            if(flag>0) return res.json({status:1,msg:'已經刪除'})
            return res.json({status:0,msg:'未刪除'})
        } else return res.json({status:0,msg:'無指定id'})
    }

    /*菜單部分*/
    // 菜品列表
    static async menuList(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        let sql = `select * from food_type where sid=?`
        if(req.body.search) sql = `${sql} and title like '%${req.body.search}%'`
        sql=`${sql} order by rank asc`
        let data = await db.query(sql,[user.sid])
        return res.json({status:1,msg:'全部列出',data:data})
    }

    static async menuSave(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        let id = parseInt(req.body.id)
        if(!id){ //新增
            let data = {
                title: trim(req.body.title),
                intro: trim(req.body.intro),
                rank: parseInt(req.body.rank),
                price: parseFloat(req.body.price),
                tid: parseInt(req.body.tid),
                sid: parseInt(user.sid),
                thumb: req.body.thumb,
                time: $.date2stamp()
            }
            if(data.title.length<=0 || data.title.length>30) return res.json({status:0,msg:'標題字符長度不符'})
            if(data.price<=0) return res.json({status:0,msg:'金額不規範'})
            if(!data.tid) return res.json({status:0,msg:'未分類'})
            let id = await db.insert('food',data)
            if(id>0) return res.json({status:1,msg:'插入成功'})
            else return res.json({status:0,msg:'插入失敗，數據寫入錯誤'})
        }else{ //編輯
            let data = {
                id: id,
                sid: parseInt(user.sid),
                title: trim(req.body.title),
                intro: trim(req.body.intro),
                rank: parseInt(req.body.rank),
                price: parseFloat(req.body.price),
                tid: parseInt(req.body.tid),
                thumb: req.body.thumb,
                time: $.date2stamp()
            }
            let flag = (await db.query('update food set title=?,intro=?,rank=?,price=?,tid=?,time=?,thumb=? where id=? and sid=?',[data.title,data.intro,data.rank,data.price,data.tid,data.time,data.thumb,data.id,user.sid]))['affectedRows']
            if(flag>0) return res.json({status:1,msg:'編輯成功'})
            else return res.json({status:0,msg:'編輯失敗'})
        }
    }

    // 改變菜供應狀態
    static async menuEffect(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        let id = parseInt(req.body.id)
        if(id){
            let effect = parseInt(req.body.effect)==0?0:1
            let flag = (await db.query('update food set is_effect=? where id=? and sid=?',[effect,id,user.sid]))['affectedRows']
            if(flag>0) return res.json({status:1,msg:'狀態改變'})
            else return res.json({status:1,msg:'狀態未改變'})
        } else return res.json({status:0,msg:'無指定id'})
    }
    // 刪除菜品
    static async menuDelete(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        let id = parseInt(req.body.id)
        if(id){
            let flag = await db.delete('food',id,user)
            if(flag>0) return res.json({status:1,msg:'已經刪除'})
            else return res.json({status:0,msg:'未刪除，找不到指定刪除行'})
        } else return res.json({status:0,msg:'無指定id'})
    }

    /*配置部分*/
    // 列出用戶
    static async setUserList(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        let data = await db.list('user_position',user)
        return res.json({status:1,data:data,msg:'全部列出'})
    }
    //列出職位
    static async setPositionList(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        // 店長特權
        //if(user.pid!=1) return res.json({status:0,msg:'無權限用戶！'})
        let data = await db.query('select * from position')
        return res.json({status:1,data:data,msg:'全部列出'})
    }
    // 保存用戶
    static async setUserSave(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        // 店長特權
        if(user.pid!=1) return res.json({status:0,msg:'無權限用戶！'})
        let id = parseInt(req.body.id)
        //if(id == user.id) return res.json({status:0,msg:'不可修改本人!'})
        if(!id){ // 新增
            // 同一家店重複用戶
            let count = await db.query('select id from user where username=? and sid=?',[req.body.username,user.sid])
            if(count.length>0) return res.json({status:0,msg:'該店已經存在該用戶，請使用其他名'})
            let data = {
                sid:user.sid,
                username:req.body.username,
                password:md5(req.body.password),
                token:'',
                pid:req.body.pid,
                createtime:(new Date()).getTime()/1000,
                is_del:0
            }
            let id = await db.insert('user',data)
            if(id>0) return res.json({status:1,msg:'插入成功'})
            else return res.json({status:0,msg:'插入失敗，數據寫入錯誤'})
        }else{
            let data = {
                id:id,
                password:md5(req.body.password),
                token:'',
                pid:req.body.pid
            }
            let flag = (await db.query('update user set password=?,token=?,pid=? where id=? and sid=?',[data.password,data.token,data.pid,data.id,user.sid]))['affectedRows']
            if(flag>0) return res.json({status:1,msg:'編輯成功'})
            else return res.json({status:0,msg:'沒有改變'})
        }
    }
    // 刪除店員
    static async setUserDelete(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        // 店長特權
        if(user.pid!=1) return res.json({status:0,msg:'無權限用戶！'})
        let id = parseInt(req.body.id)
        if(id == user.id) return res.json({status:0,msg:'不可刪除本人!'})
        if(id){
            let flag = await db.delete('user',id,user)
            if(flag>0) return res.json({status:1,msg:'已經刪除'})
            else return res.json({status:0,msg:'未刪除，找不到指定刪除行'})
        } else return res.json({status:0,msg:'無指定id'})
    }
    // 修改店鋪名
    static async setShop(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        // 店長特權
        if(user.pid!=1) return res.json({status:0,msg:'無權限用戶！'})
        if(req.body.title && req.body.img && req.body.phone && req.body.description && req.body.location){
            let title = trim(req.body.title)
            let description = trim(req.body.description)
            let location = trim(req.body.location)
            let flag = (await db.query('update shop set title=?,phone=?,img=?,description=?,background=?,location=? where id=?',[title,req.body.phone,req.body.img,description,req.body.background,location,user.sid])).changedRows
            if(flag>0) return res.json({status:1,msg:'Edit Success'})
            else return res.json({status:0,msg:'Edit Fail'})
        } else {
            let data = (await db.query('select title,phone,img,description,background,location from shop where id=?',[user.sid]))
            return res.json({status:1,msg:'Error: info invalid',data:data[0]})
        }
    }
    // 列出桌位
    static async deskList(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        // 左連接查詢
        const sql = 'select *,IFNULL(orderNum,0) orderNum from desk d left join (select count(*) as orderNum,did from orders where endtime=0 group by did) o on d.id=o.did where d.sid=? and d.is_del=0'
        let data = await db.query(sql,[user.sid])
        return res.json({status:1,data:data,msg:'全部列出'})
    }
    // 新增餐桌
    static async deskSave(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        if(user.pid!=1) return res.json({status:0,msg:'無權限用戶！'})
        let id = parseInt(req.body.id)
        if(!id){ // 新增桌
            let data = {
                title:trim(req.body.title),
                num:parseInt(req.body.num),
                sid:user.sid
            }
            let id = await db.insert('desk',data)
            if(id>0) return res.json({status:1,msg:'插入成功'})
            else return res.json({status:0,msg:'插入失敗，數據寫入錯誤'})
        } else {
            let data = {
                id: id,
                title:trim(req.body.title),
                num:parseInt(req.body.num),
                sid:user.sid
            }
            let flag = await db.query('update desk set title=?,num=? where sid=? and id=?',[data.title,data.num,data.sid,data.id])
            if(flag && flag.changedRows) return res.json({status:1,msg:'修改成功'})
            else return res.json({status:0,msg:'無修改'})
        }
    }
    // 删除餐桌
    static async setDeskDelete(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        if(user.pid!=1) return res.json({status:0,msg:'無權限用戶！'})
        let id = parseInt(req.body.id)
        if(id){
            // 查找該桌未完成訂單
            let flag = await db.query('select id from orders where endtime=? and did=?',[0,id])
            if(flag.length>0) return res.json({status:0,msg:'餐桌有未完成訂單，刪除餐桌失敗！'})
            flag = (await db.query('update desk set is_del=1 where sid=? and id=?', [user.sid,id]))['changedRows']
            if(flag>0) return res.json({status:1,msg:'已經刪除'})
            else return res.json({status:0,msg:'未刪除，找不到指定刪除餐桌编号'})
        } else return res.json({status:0,msg:'缺少桌參數ID'})
    }
    // 按桌列出未完成訂單
    static async orderListByDesk(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        let did = parseInt(req.body.id) //桌號
        if(!did) return res.json({status:0,msg:'輸入桌ID參數'})
        let data = {}
        data['orders'] = await db.query('select * from orders_desk where did=? and endtime=? and sid=?',[did,0,user.sid])
        data['pays'] = await db.query('select * from payway where is_del=0')
        data['currency'] = await db.query('select * from currency where is_del=0')
        return res.json({status:1,msg:'',data:data})
    }
    // 歷史訂單
    static async orderHistoryList(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        let cPage = parseInt(req.body.currentPage) // 当前页
        if(!cPage) return res.json({status:0,msg:'頁數錯誤'})
        let count = await db.query('select count(*) as count from orders_desk where sid=? and endtime>0',[user.sid])
        if(count && count[0] && count[0].count) count=count[0].count
        else count = 0
        let pages = (count % PAGE_SIZE==0)?parseInt(count/PAGE_SIZE):(parseInt(count/PAGE_SIZE)+1)
        const sql = 'select * from orders_desk where sid=? and endtime>0 order by id desc limit ?,?'
        let data = await db.query(sql,[user.sid,(cPage-1)*PAGE_SIZE,PAGE_SIZE,0])

        let page = {
            totalPage:pages, // 總頁數
            currentPage:cPage, //當前頁
            count:count, //總數據量
            pageSize:PAGE_SIZE //每頁數目
        }
        return res.json({status:1,msg:'',data:data,page:page})
    }
    // 結賬訂單
    static async pay(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'未登錄或登錄狀態失效'})
        let id = parseInt(req.body.id) //訂單號
        if(!id) return res.json({status:0,msg:'缺少訂單號ID'})
        let content = JSON.parse(req.body.content) //菜單內容，可能有變化
        let pay = req.body.pay // 各種支付方式
        let price = 0
        for(let i in content){ // 重新計算價格
            price+=content[i].price*content[i].count
        }
        // 更新訂單為已結算狀態
        let flag = await db.query('update orders_desk set content=?,endtime=?,price=?,pay=? where id=? and sid=?', [
            JSON.stringify(content),
            Date.parse(new Date())/1000,
            price,
            pay,
            id,
            user.sid
        ])
        if(flag && flag.changedRows) return res.json({status:1,msg:'結算成功'})
        else return res.json({status:0,msg:'結算失敗，未結算'})
    }
}

module.exports=Admin
