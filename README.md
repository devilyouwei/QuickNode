# QuickNode

![Qbite](https://wap.qbite.us/favicon.png 'Qbite, faster order')

**_An easier way(Convention Routing) to create RESTful APIs for web applications with Node.js_**

## Introduction

QuickNode is an open-source project separated from [Qbite](https://github.com/devilyouwei/Qbite).

We(Qbyte LLC US) now use QuickNode as a back-end core framework for our projects. Our projects work well and stable on this framework but there may be still some unknown vulnerabilities or bugs that need to be found out and fixed. We are very happy to share this with all the developers and help you have a simple web framework to create various JSON or plain text APIs.

QuickNode is based on Node.js and expressJS to handle HTTP requests and responses.

QuickNode uses a better URL mode(Convention Routing) to handle the HTTP data exchange. So in QuickNode, you never config
router any more. When you want to provide a new API for frontend, the only thing you need to do is creating a class file or add actions in a class file in Controller.

It looks like 'http://localhost:3000/Index/index'. It's easy to understand that first part is domain and port, the second part is the controller and after the controller is the action. This URL mode has already been used in many popular MVC frameworks such as ThinkPHP.

## Quick Start

This framework is so easy to start with even when you have no experience in Node.js development before.

To use this framework, you need to install Node.js and npm first.

For any os platform, we recommend you to download Node from its official website. <https://nodejs.org>

After you install Node.js you need to do the following steps to start a project.

**Use git clone to install**

```bash
git clone https://github.com/devilyouwei/QuickNode.git
```

**Add `.env` file**

```bash
# APP
APP_NAME=Quick Node
APP_PORT=3000
APP_URL=http://localhost:3000

# DB
DB_DIALECT=mysql
MYSQL_HOST=localhost
MYSQL_USER=web3
MYSQL_PASS=web3
MYSQL_DB=web3

# OSS
# ...
```

**Go to the project directory**

```bash
npm install
# or
yarn

npm run dev
# or
yarn dev
```

**Open your browser**

Input address: http://localhost:3000/Index/index

Index is `Controller`, index is `Action`

**Example**

![Successful example](https://github-devilyouwei.oss-us-west-1.aliyuncs.com/quicknode/ex1.png)

**We use PM2**

```
# dev mode
yarn dev

# product mode
yarn start

# list all services
yarn pm2 list
```

## How it works?

After you finish the quick start. You are ready to create APIs.

Look at the directory tree in QuickNode.

You will create new controllers and actions in the directory called 'Controller'

Each class file(controller) in the 'Controller' directory will map to a controller, and each function in the class file will map to an action.

In all, QuickNode will map the URL(http://localhost/controller/action) to the controller and the action in 'Controller directory'.

You don't need to config anything for the routings.

## Example

For example, you create a file named 'Test.js', there is a class named 'Test' and a function named 'test' in it.

Also, you want to return a JSON data type.

```js
class Test {
    static async test(req, res) {
        const id = req.body.id
        return res.json({ status: 1, data: { id: id }, msg: 'Successful data loaded' })
    }
}
module.exports = Test
```

Now, you try to visit: http://localhost:3000/Test/test

![Successful example](https://github-devilyouwei.oss-us-west-1.aliyuncs.com/quicknode/ex2.png)

It works and you get JSON from this API!

## Config

The directory 'Config' is used to store the configuration files for your project.

-   web.json: the global configuration for your website.
-   db.json: the configuration for your database connection.
-   smtp.json: the configuration for your smtp server to send email.
-   stripe.json: only if you are using stripe, not required.
-   oss.json: only if you are using Ali-OSS server, not required.

QuickNode has already added some useful node packages in it. For more details, refer to package.json

If you are going to add some other third-party libs, add configuration files(json files) in 'Config' directory, and require them when necessary

We also recommend to use prettier lint rules for the project. However, if you don't like prettier, you can just remove it from
the package.json

## Login and Register Example

This is an example for user login and register APIs. It shows how to connect MySQL, send verify email, use md5 to encrypt

```js
const md5 = require('md5')
const $ = require('./private/Public.js')
const domain = require('../Config/web.json').domainBack
const db = require('./private/DB.js')
const mail = require('./private/Mail.js')

class User {
    static async register(req, res) {
        try {
            const user = $.fitTxt(req.body)
            user.is_effect = 0
            const sql = `select id,email,is_effect from users where email=?`
            const data = await db.query(sql, [user.email])
            if (data[0] && data[0].is_effect == 1) throw new Error('Email is taken')
            const randNum = md5(user.password + $.random(100, 999) + new Date().getTime())
            const url = `${domain}/User/verify?v=${randNum}`
            const html = `<p>Welcome To My Resource，Your Vertification URL is: </p>
            <br><a href="${url}" target="_blank">${url}</a>`
            const opt = {
                to: user.email,
                title: 'My Resource Sign Up',
                html: html
            }
            await mail.send(opt) // 發送激活郵件
            user.code = randNum
            user.createtime = new Date().getTime() / 1000
            user.password = md5(user.password)
            let id = 0
            if (data[0]) {
                //user has registered
                const flag = await db.query('update users set username=?,password=?,code=?,createtime=? where id=?', [
                    user.username,
                    user.password,
                    user.code,
                    user.createtime,
                    data[0].id
                ])
                if (flag && flag.changedRows > 0) id = data[0].id
            } else id = await db.insert('users', user)
            if (id)
                return res.json({
                    status: 1,
                    msg: 'Your account is created successfully, remember to verify your email'
                })
            throw new Error('Fail to create the account')
        } catch (e) {
            return res.json({ status: 0, msg: e.message })
        }
    }

    static async verify(req, res) {
        try {
            const verify = $.fitTxt(req.body.v)
            if (!verify) throw new Error('Invalid verify url')
            const sql = `update users set is_effect=1 where code=?`
            const flag = await db.query(sql, [verify])
            if (flag && flag.changedRows > 0) return res.end('Verify your email successfully! Go to sign in now')
            throw new Error('Fail to verify your email')
        } catch (e) {
            return res.end(e.message)
        }
    }
    static async login(req, res) {
        try {
            const user = req.body
            user.password = md5(user.password)
            let data = await db.query('select * from users where email=? and password=?', [user.email, user.password])
            if (data[0]) {
                if (!data[0].is_effect) throw new Error('Unverified email, please verify your email first')
                // generate token
                const token = md5(`${md5(new Date().getTime())}${user.password}${user.username}${user.email}myresource`)
                data[0].token = token
                delete data[0].password
                delete data[0].createtime
                const flag = await db.query('update users set token=? where id=?', [token, data[0].id])
                if (flag && flag.changedRows > 0)
                    return res.json({ status: 1, data: data[0], msg: 'successs to login' })
                throw new Error('Fail to update user login status')
            }
            throw new Error('Fail to login, invalid email or password')
        } catch (e) {
            return res.json({ status: 0, msg: e.message })
        }
    }
}
module.exports = User
```

## Static Files

Static files such as zips, images, css... that you will visit directly like: http://localhost/ex.png

Put them in directory 'static'

## Thank you

We are going to make this open-source project better in the future.

Thank you for your supporting and using QuickNode.

## Our Qbite

The Qbite backend is totally developed based on QuickNode, this is our example.

![Qbite](https://github-devilyouwei.oss-us-west-1.aliyuncs.com/qbite/qbite%20qrcode.jpg)

Scan the QRcode and order some food now!

## GitHub

<https://github.com/devilyouwei/QuickNode>
