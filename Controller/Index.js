class Index {
    static async index(req, res) {
        res.end('<h1 style="text-align:center;padding-top:10%;"> Welcome to QuickNode!</h1>')
    }
}
module.exports = Index
