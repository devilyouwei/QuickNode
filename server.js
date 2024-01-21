/* http启动服务 */
require('dotenv').config()
const app = require('express')()
const multipart = require('connect-multiparty')
const root = require('app-root-path')
const init = require('./Init')

global.__ROOT__ = root.path // 設置根目錄
function allowOrigin(_, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,POST')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    res.header('Access-Control-Allow-Credentials', 'true')
    next()
}
app.use(allowOrigin)
// 使用formData格式傳輸
app.use(multipart())
// MAP路由
init.controller(app)
app.listen(process.env.APP_PORT)
