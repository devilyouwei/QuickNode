const $ = require('./private/Public.js')
const db = require('./private/DB.js')
class Index{
    static async index(req,res){
        res.send('<h1> Welcome to RestfulNode!</h1>')
        res.send('<h2> It works!</h2>')
    }
}
module.exports=Index
