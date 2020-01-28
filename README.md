
# QuickNode

![Qbite](https://wap.qbite.us/favicon.png "Qbite, faster order")

***An easier way to create restful APIs for web applications with Node.js***

## Introduction

QuickNode is an open-source project separated from [Qbite](https://github.com/devilyouwei/Qbite).

We(Qbyte LLC US) now use QuickNode as a back-end core framework for our projects. Our projects work well and stable on this framework but there may be still some unknown vulnerabilities or bugs that need to be found out and fixed. We are very happy to share this with all the developers and help you have a simple web framework to create various JSON or plain text APIs.

QuickNode is based on Node.js and expressJS to handle HTTP requests and responses. Based on them, QuickNode uses a better URL mode to handle the HTTP data exchange. It just looks like http://localhost:3000/Index/index. It's easy to understand that first part is domain and port, the second part is the controller and after the controller is the action. This URL mode has already been used in many popular MVC frameworks such as ThinkPHP.

Maybe you come from PHP, JavaEE or Node.js. Never mind, you'll find it familiar.

## Quick Start

This framework is so easy to start with even when you have no experience in Node.js development before.

To use this framework, you need to install Node.js with npm on your computer first. For any os platform, we recommend you to download Node from its official website. <https://nodejs.org>

After you install Node.js you need to do the following steps to start a project.

**Open cmder**

```
git clone https://github.com/devilyouwei/QuickNode.github
```

**Go to the project directory**

```
npm install
```

**Start server**

```
node ./Server.js
```

**Open your browser**

Input address: http://localhost:3000/Index/index

Index is Controller, index is Action

**Example**

![Successful example](https://github-devilyouwei.oss-us-west-1.aliyuncs.com/quicknode/%E6%B7%B1%E5%BA%A6%E6%88%AA%E5%9B%BE_%E9%80%89%E6%8B%A9%E5%8C%BA%E5%9F%9F_20200126122839.png)

**Recommend to use supervisor**

It's a better way to use supervisor instead of node.

```
npm install -g supervisor

supervisor ./Server.js
```

Supervisor will re-run the latest code dynamically and automatically after you make some changes.

## How it works?

After you finish the quick start. You will be ready to create APIs for your web projects.

Look at the directory tree in QuickNode.

You are going to create new controllers and actions in the directory called 'Controller'

Each class file in the 'Controller' directory will map a controller, and each function in the class file will map an action.

After you clone or download QuickNode, you can create class files in 'Controller' directory by referring to the examples in it.

## Example

For example, you create a file named 'Test.js', and edit it with class 'Test', add a function in this class, like 'test'.

```js
class Test{
    static async test(req,res){
        return res.json({status:1,data:'test data',msg:'Successful data loaded'})
    }
}
module.exports=Test
```

Now, you can try to visit: http://localhost:3000/Test/test

Example works!

## Config

The directory 'Config' is used to store the configuration files for your project.

You can edit your MySQL connection configuration in db.json. Also, you can config your SMTP server and OSS sever info to connect with them.

QuickNode has already added some useful js packages in it. For more details, refer to package.json

## Thank you

We are going to make this open-source project better in the future.

Thank you for your supporting and using QuickNode.

## Our Qbite

![Qbite](https://github-devilyouwei.oss-us-west-1.aliyuncs.com/qbite/qbite%20qrcode.jpg)

*Scan the QRcode and order what you want!*
