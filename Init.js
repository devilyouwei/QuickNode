/**
 * 初始化网站模块，应可以自动匹配对应路由，采用thinkphp约定的模式
 * devilyouwei
 * 2018-8-19
 * MIT license
 * @returns {module}
 */
const CTRL = __dirname+'/Controller/'

class Init{
    static controller(app){
        if(!app){
            return next('No App Object')
        }

		//http统一请求
        app.all('*',(req,res,next)=>{
            if(req.method=="GET"){
                req.body = req.query // get强制转post参数
            }
            this.onlyPost(req,res,next)
        })
    }

    //将所有get，post请求转换为post统一请求
    static onlyPost(req,res,next){
        let path = req.path
        //取得控制器和方法
        let ctl = path.split('/')[1]
        let act = path.split('/')[2]
        if(!ctl) ctl = 'Index'
        if(!act) act = 'index'

        try {
            let Controller = require(CTRL+ctl)
            let Action = Controller[act]
            Action(req,res)
        } catch(err) {
            throw err
        }
    }
}

module.exports = Init
