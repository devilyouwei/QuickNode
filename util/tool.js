require('dotenv').config()
const OSS = require('ali-oss')

const { OSS_REGION, OSS_KEY_ID, OSS_KEY_SECRET, OSS_BUCKET } = process.env
const oss = new OSS({
    region: OSS_REGION,
    accessKeyId: OSS_KEY_ID,
    accessKeySecret: OSS_KEY_SECRET,
    bucket: OSS_BUCKET
})

module.exports = {
    async putObject(name, path) {
        for (let i = 0; i <= oss.options.retryMax; i++) {
            try {
                return await oss.put(name, path)
            } catch (e) {
                console.error(e)
            }
        }
    },
    async sleep(time) {
        return new Promise(resolve => setTimeout(resolve, time))
    }
}
