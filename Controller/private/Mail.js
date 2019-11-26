const nodemailer = require('nodemailer')
const config = require('../../Config/smtp.json')
const $ = require('./Public.js')
const transporter = nodemailer.createTransport(config)

class Mail{
    // smtp发送邮件
    static async send(obj){
        if(typeof obj !== 'object') throw new Error('should give object')
        if(!$.checkEmail(obj.to)) throw new Error('to email format error')
        let opt = {
            from: config.auth.user,
            to: obj.to,
            subject: obj.title,
            text: obj.text,
            html: obj.html
        }
        return new Promise((resolve,reject)=>{
            transporter.sendMail(opt, (error, info) => {
                if (error) resolve(false)
                else resolve(info)
            })
        })
    }
}

module.exports=Mail
