const axios = require('axios')
const isJSON = require('@stdlib/assert-is-json')

module.exports = {
    async download(req, res) {
        try {
            const url = req.body.url
            if (!url) throw new Error('url is empty')

            const response = await axios.get(url)
            const json = response.data

            if (!json) throw new Error('JSON file not found')
            if (!isJSON(JSON.stringify(json))) throw new Error('JSON not valid')

            res.json(json)
        } catch (e) {
            res.json({ status: 0, msg: e.message })
        }
    }
}
