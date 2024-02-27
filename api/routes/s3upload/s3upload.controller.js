const express = require('express')
const router = express.Router()
const { requestUploadUrl } = require('./s3upload.service')


router.post("/requestUploadUrl", async (req, res, next) => {
    try {
        const { fileType } = req.body.fileType
        const { name, uploadUrl } = await requestUploadUrl(fileType)
        res.status(200).json({ name, uploadUrl })
    } catch (err) {
        next(err)
    }
})

module.exports = router