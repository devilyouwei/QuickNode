class Test {
    static async test(req, res) {
        const id = req.body.id
        return res.json({ status: 1, data: { id: id }, msg: 'Successful data loaded' })
    }
}
module.exports = Test
