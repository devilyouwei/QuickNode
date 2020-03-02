/* http启动服务 */
const app = require('express')()
const multipart = require('connect-multiparty')
const root = require('app-root-path')
const init = require('./Init')

global.__ROOT = root.path // 設置根目錄
const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    res.header('Access-Control-Allow-Credentials', 'true')
    next()
}
app.use(allowCrossDomain)
// 使用formData格式傳輸
app.use(multipart())
// MAP路由
init.controller(app)
const port = parseInt(process.argv[2])
app.listen(port || 3000)
