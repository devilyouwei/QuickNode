/*
 * http启动服务
 */
let express = require('express');
let init = require('./Init');
let app = express();
const multipart = require('connect-multiparty'); 
const root = require('app-root-path')
global.__ROOT = root.path //設置根目錄
// 使用formData格式傳輸
app.use(multipart())

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials','true');
    next();
};
app.use(allowCrossDomain)

//可以根据
init.controller(app)
 
app.listen(3000)
