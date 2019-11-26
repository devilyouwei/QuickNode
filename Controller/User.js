const db = require('./private/DB.js')
const $ = require('./private/Public.js')
const trim = require('trim')
const md5 = require('md5')
const mail = require('./private/Mail.js')
class User{
    // 登陆
    static async login(req,res){
     	
        let username = trim(req.body.username) // 用戶名
        let email = trim(req.body.email) // 郵箱
        let password = md5(req.body.password) // 密碼

        // 開始登陸過程
        if(username && email && password){
          
            let data = await db.query('select * from login_view where username=? and password=? and email=?',[username,password,email])
            if(data && data.length>0) {
                if(data[0]['is_del']==1) return res.json({status:0,msg:'店鋪被禁用，請聯繫管理員'})
                const token = md5(Date.parse(new Date()) + data[0].username + data[0].password)
                let flag = (await db.query('update user set token = ? where id = ?', [token, data[0]['id']])).changedRows
                if(flag) {
                    data[0].token = token
                    delete data[0]['password'] // 密码不返回
                    return res.json({status:1, msg:'登錄成功', data:data[0]})
                } else return res.json({status:0,msg:'登錄記錄寫入失敗'})
            } else return res.json({status:0,msg:'登錄信息錯誤'})
        } else return res.json({status:0,msg:'輸入用戶名或者密碼'})
    }

    // 地區選擇
    static async areas(req,res){
        // 創建店鋪
        let data = await db.query('select * from area where is_del=0')
        return res.json({status:1,data:data})
    }

    // 獲取當前用戶店鋪信息
    static async shopInfo(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:-1,msg:'登錄狀態失效！'})
        let data = await db.query('select * from shop where id=?',[user.sid])
        if(data && data[0]) return res.json({status:1,data:data[0],msg:'店鋪信息獲得'})
        else return res.json({status:0,msg:'無法獲得店鋪信息'})
    }

    // 發送驗證碼
    static async sendCode(req,res){
        let email = trim(req.body.email)
        if(!email || !$.checkEmail(email)) return res.json({status:0,msg:'郵箱格式錯誤，重新填寫'})

        // 檢查郵箱是否已經被註冊
        let flag = await db.query('select email from shop where email=?',[email])
        if(flag && flag.length>0) return res.json({status:0,msg:'該郵箱已經存在，請更換其他未註冊的郵箱'})

        // 檢查郵箱是否發送過驗證碼
        let reg = await db.query('select * from reg_log where email=?',[email])
        if(reg && reg.length>0)
            if((new Date()).getTime()/1000 - reg[0].createtime<=60)
                return res.json({status:0,msg:'發送過於頻繁，請稍後重試！'})

        let randNum = parseInt($.random(1000,9999))
        let html = '<p>歡迎註冊新的店鋪，您的驗證碼是：</p><br><h1>'+randNum+'</h1>'
        const opt = {
            to: email,
            title: '店鋪註冊驗證',
            html: html
        }

        let result = await mail.send(opt) // 發送激活郵件
        if(!result) return res.json({status:0,msg:'郵件發送失敗，請更換有效郵箱'})

        const data = {
            id:null,
            email:email,
            createtime:(new Date()).getTime()/1000,
            ip:req.ip,
            code:randNum
        }
        if(reg && reg.length>0){
            let flag = await db.query('update reg_log set email=?,createtime=?,ip=?,code=? where id=?',[data.email,data.createtime,data.ip,data.code,reg[0].id])
            if(flag && flag.changedRows) return res.json({status:1,msg:'郵箱驗證碼已經發送',data:reg[0].id})
            else return res.json({status:0,msg:'註冊郵件發送失敗'})
        } else {
            let id = await db.insert('reg_log',data)
            if(id) return res.json({status:1,msg:'郵箱驗證碼已經發送',data:id})
            else return res.json({status:0,msg:'註冊郵件發送失敗'})
        }
    }

    // 註冊，包含郵件發送和原子執行的事務插入
    static async register(req,res){
        // 檢查郵件驗證碼
        let code = parseInt(req.body.code)
        let eid = parseInt(req.body.eid)
        if(!eid || !code) return res.json({status:0,msg:'請先發送驗證碼，并輸入驗證碼'})
        let reg = await db.query('select * from reg_log where id=?',[eid])
        if(reg && reg[0]){
            if(reg[0].code != code) {
                db.query('delete from reg_log where id=?',[eid]) // 刪除該郵件記錄，確保安全
                return res.json({status:0,msg:'驗證碼錯誤，請重新發送！'})
            }
        } else return res.json({status:0,msg:'請先發送驗證碼，并輸入驗證碼'})

        let shop = { // 新增店鋪
            email:$.checkEmail(trim(req.body.email)),
            title:trim(req.body.shop),
            time:(new Date()).getTime()/1000,
            aid:parseInt(req.body.area) || 1, // 默認澳門特別行政區
            is_del:0
        }
        if(!shop.email) return res.json({status:0,msg:'郵箱格式錯誤，重新填寫'})
        if(!shop.title) return res.json({status:0,msg:'缺少店鋪名'})

        // 檢查郵箱是否已經被註冊
        let flag = await db.query('select email from shop where email=?',[shop.email])
        if(flag && flag.length>0) return res.json({status:0,msg:'該郵箱已經存在，請更換其他未註冊的郵箱'})

        let user = { // 新增用戶
            username:trim(req.body.username),
            password:md5(trim(req.body.password)),
            pid:1,
            sid:0,
            admin:0,
            token:md5(Date.parse(new Date()) + trim(req.body.username) + trim(req.body.password)),
            createtime:(new Date()).getTime()/1000,
            is_del:0
        }
        if(!user.username) return res.json({status:0,msg:'缺少用戶名'})
        if(!user.password) return res.json({status:0,msg:'缺少密碼'})
        // 檢查地區編號是否存在可用
        flag = await db.query('select id from area where id=? and is_del=0',[shop.aid])
        if(!flag || !flag[0] || !flag[0].id) return res.json({status:0,msg:'地區錯誤錯誤，重新填寫'})


        let trans = await db.transaction() // 事務寫入
        if(!trans) return res.json({status:0,msg:'數據庫創建失敗，稍後再試！'})
        try{
            let insert = {}
            insert.shopId = (await trans.query('insert into shop set ?',shop))[0].insertId // 插入店鋪
            user.sid = insert.shopId
            insert.userId = (await trans.query('insert into user set ?',user))[0].insertId // 插入店長
            await trans.commit() // 事務提交
            delete user.password // 刪除密碼
            user.id = insert.userId
            insert.user = user
            return res.json({status:1,msg:'創建成功',data:insert})
        } catch(e) {
            await trans.rollback() // 回滾事務
            return res.json({status:0,msg:'創建失敗，數據庫寫入失敗！'})
        } finally {
            trans.destroy() // 銷毀事務
        }
    }

    static async regMore(req,res){
        let user = await $.auth(req.body.user)
        if(!user) return res.json({status:0,msg:'未登錄或登錄狀態失效'})

        let location = trim(req.body.location)
        let certificate = trim(req.body.certificate)
        if(!location) return res.json({status:0,msg:'地址呢'})
        if(!certificate) return res.json({status:0,msg:'證書圖片呢'})
        let flag = await db.query('update shop set location=?,certificates=? where id=?',[location,certificate,user.sid])
        if(flag && flag.changedRows) return res.json({status:1,msg:'註冊成功'})
        else return res.json({status:0,msg:'註冊失敗，無法更新信息'})
    }

}
module.exports=User
