const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const crypto = require("crypto");
const error = require('../../services/error')

const s3 = new S3Client()

exports.requestUploadUrl = async (fileType) => {
    const Key = crypto.randomUUID()
    const s3Params = {
        Bucket: "pie-madness",
        Key,
        ContentType: fileType,
        ACL: 'public-read'
    };
    const command = new PutObjectCommand(s3Params);
    try {
        const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
        return {
            name: Key,
            uploadUrl
        }
    } catch (err) {
        console.error(err);
        throw new error.ServerError('unable to get presigned url')
    }
}