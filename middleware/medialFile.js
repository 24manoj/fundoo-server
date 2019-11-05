/**@description importing required modules */
const aws = require('aws-sdk')
const multer = require("multer");
const multers3 = require('multer-s3')
require('dotenv').config();
/**@description configuration od s3 bucket */
const s3 = new aws.S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY,
    region: 'us-east-2'
});
/**
 * @desc filters  types of files can be uploaded bucket
 * @param req request contains all the requested data
 * @param file contains data sent from frontend
 * @param cb callbacks with err or data
 * @return return respose sucess or failure
 */
const fileFilter = (req, file, cb) => {
    (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') ? cb(null, true) : cb(new Error("not a valid format"))
}
const upload = multer({
    fileFilter,
    storage: multers3({
        s3: s3,
        bucket: 'fundoonotess3',
        acl: 'public-read',
        metadata: function (req, file, cb) {
            console.log("in metadata", req.body);

            cb(null, { fieldName: 'TESTING_META_DATA' });
        },
        key: function (req, file, cb) {
            console.log('in media file upload', file);

            cb(null, file.originalname)
        }
    })
})
module.exports = upload; 