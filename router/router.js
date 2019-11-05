/**@description importing modules */
let router = require('express').Router();
let controller = require('../controller/userController')
let auth = require('../middleware/auth')
let upload = require('../middleware/medialFile')

/** @description   routes to endPoints*/
router.route('/register').post(controller.register)
router.route('/login').post(controller.login)
router.route('/forgotPassword').post(controller.forgotPassword)
router.route('/userCheck').post(controller.userCheck)
router.route('/resetPassword/:token').post(auth.verify, controller.resetPassword)
router.route('/upload').post(auth.verifyUser, upload.single('image'), controller.fileUpload)
router.post('/checkCollaborated', auth.verifyUser, controller.checkCollaborated)

module.exports = router;