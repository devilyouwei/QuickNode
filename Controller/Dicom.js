const axios = require('axios')
const isJSON = require('@stdlib/assert-is-json')
const dicom = require('dicom-parser') // 添加DICOM库或工具
const fs = require('fs')
const os = require('os')
const md5 = require('md5')
const db = require('../DB')

const $ = require('../util/tool')

module.exports = {
    async download(req, res) {
        try {
            const id = parseInt(req.body.id) // master id
            const url = req.body.url // json download url
            const hid = parseInt(req.body.hospital_id) // hospital id
            if (!url) throw new Error('url is empty')
            if (!id) throw new Error('id is empty')
            if (!hid) throw new Error('hospital id is empty')

            const response = await axios.get(url)
            const json = response.data

            if (!json) throw new Error('JSON file not found')
            if (!isJSON(JSON.stringify(json))) throw new Error('JSON not valid')

            const urls = []
            const data = []

            if (hid === 1) {
                const url = `https://zscloud.zs-hospital.sh.cn/vna/image/Home/ImageService?CommandType=GetImage&ContentType=application/dicom&ObjectUID=`
                const series = json['PatientInfo']['StudyList'][0]['SeriesList']
                for (const item of series) {
                    const imgs = item['ImageList']
                    for (const item of imgs) {
                        const name = `${item['UID']}.dcm`
                        const path = `${os.tmpdir()}/${name}`
                        urls.push({ url: `${url}${item['UID']}`, name, path, md5: md5(item['UID']) })
                        data.push({ master_id: id, file_path: `${url}${item['UID']}`, unique: md5(item['UID']) })
                    }
                }
            }
            await db.CTMasterChild.bulkCreate(data, {
                updateOnDuplicate: ['file_path', 'master_id']
            })
            res.json({ status: 1, data, msg: 'start download' })

            let count = 0
            for (const item of urls) {
                count++
                axios
                    .get(item.url, { responseType: 'stream' })
                    .then(res => {
                        const writer = fs.createWriteStream(item.path)
                        res.data.pipe(writer)

                        writer.on('finish', async () => {
                            // put to oss
                            const res = await $.putObject(item.name, fs.readFileSync(item.path))
                            // decode dicom
                            const result = dicom.parseDicom(fs.readFileSync(item.path))
                            const data = {}
                            for (const i in TAGS) data[i] = result.string(TAGS[i])
                            const defaults = {
                                master_id: id,
                                unique: item.md5,
                                file_path: item.url,
                                oss_url: res.url,
                                text: JSON.stringify(data)
                            }

                            db.CTMasterChild.upsert(defaults)
                                .then(console.log)
                                .catch(console.error)
                        })
                        writer.on('error', console.log)
                    })
                    .catch(console.error)

                if (count >= 10) {
                    count = 0
                    await $.sleep(3000)
                }
            }

            // res.json(json)
        } catch (e) {
            res.json({ status: 0, msg: e.message })
        }
    },
    async decode(req, res) {
        try {
            const file = req.files.file
            const buff = fs.readFileSync(file.path)
            const result = dicom.parseDicom(buff)
            const data = {}
            for (const i in TAGS) data[i] = result.string(TAGS[i])

            res.json({ status: 1, data, msg: 'success to decode dicom' })
        } catch (e) {
            res.json({ status: 0, msg: e.message })
        }
    }
}

const TAGS = {
    // 患者信息
    patientName: 'x00100010',
    patientID: 'x00100020',
    patientBirthDate: 'x00100030',
    patientSex: 'x00100040',

    // 检查信息
    studyInstanceUID: 'x0020000d',
    studyDate: 'x00080020',
    studyTime: 'x00080030',
    studyDescription: 'x00081030',
    referringPhysicianName: 'x00080090',

    // 图像信息
    SOPInstanceUID: 'x00080018',
    imageType: 'x00080008',
    modality: 'x00080060',
    seriesInstanceUID: 'x0020000e',
    seriesNumber: 'x00200011',
    instanceNumber: 'x00200013',
    imagePositionPatient: 'x00200032',
    imageOrientationPatient: 'x00200037',
    pixelSpacing: 'x00280030',
    rows: 'x00280010',
    columns: 'x00280011',
    bitsAllocated: 'x00280100',
    bitsStored: 'x00280101',
    highBit: 'x00280102',
    pixelRepresentation: 'x00280103',
    windowCenter: 'x00281050',
    windowWidth: 'x00281051',
    rescaleIntercept: 'x00281052',
    rescaleSlope: 'x00281053',
    pixelData: 'x7fe00010'
}
