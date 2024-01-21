/**
 * 初始化网站模块，应可以自动匹配对应路由，采用thinkphp约定的模式
 * devilyouwei
 * 2018-8-19
 * MIT license
 * @returns {module}
 */

const CTRL = __dirname + '/Controller/'

module.exports = class {
    static controller(app) {
        //http统一请求
        app.all('*', (req, res, next) => {
            if (req.method == 'GET') req.body = req.query // get强制转post参数
            this.onlyPost(req, res, next)
        })
    }

    //映射get,post请求到对应文件
    static onlyPost(req, res, next) {
        try {
            const path = new String(req.path)

            // 查询静态文件
            if (path.indexOf('.') !== -1) return this.staticFile(path, res)
            //取得控制器和方法
            const ctl = path.split('/')[1] || 'Index'
            const act = path.split('/')[2] || 'index'
            if (!ctl) throw new Error('No Controller Given')
            if (!act) throw new Error('No Action Given')

            const controller = require(CTRL + ctl)
            const action = controller[act]
            if (!action) throw new Error('Action not found')

            return action(req, res)
        } catch (e) {
            console.error(e)
            res.json({ status: 0, msg: e.message })
        }
    }

    // 当地址出现.符号，将会输出静态文件，文件来自static目录
    static staticFile(path, res) {
        path = 'static' + path
        return res.sendFile(path, { root: __dirname }, err => {
            console.error(err)
            if (err) res.status(404).end('<h1>404 NOT FOUND</h1>')
        })
    }
}
