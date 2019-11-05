let services = require('../services/userService')
let mailchecker = require('email-existence')
let token = require('../middleware/token')
let rediscache = require('../middleware/redisService')
let status = require('../middleware/httpStatusCode')
let elasticSearch = require('../controller/elasticSearch')
let mail = require('../middleware/userMailer')
let elastic = require('../middleware/elasticSearch')
let model = require('../services/notesService')
let response = {}
let details = {}
/**
 * @desc takes input ,error validation is done,passes request next services
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */
exports.register = (req, res) => {
    try {
        req.checkBody('firstName', 'firstName invalid').isAlpha().isLength({
            min: 4
        })
        req.checkBody('email', 'email invalid').isEmail()
        req.checkBody('password', 'password invalid').isLength({ min: 8 })
        let errors = req.validationErrors();
        console.log(errors)
        if (errors) {
            response.errors = errors
            response.sucess = false
            res.status(status.UnprocessableEntity).send(response)
        }
        else {
            mailchecker.check(req.body.email, (error, result) => {
                if (result == false) {
                    response.data = null
                    response.errors = "Email is not valid"
                    response.sucess = false
                    res.status(status.notfound).send(response);
                }
                else {

                    services.register(req, (err, data) => {
                        if (err) {
                            response.data = null
                            response.errors = err
                            response.sucess = false
                            response.status = 400;
                            var error = {
                                status: 200,
                                data: null
                            }
                            res.status(status.alreadyExist).send(error);

                        }
                        else {
                            response.data = data
                            response.errors = null
                            response.sucess = true
                            res.status(status.sucess).send(response);
                        }
                    })
                }
            })
        }

    } catch (e) {
        console.log(e);
    }

}
/**
 * @desc takes input ,error validation is done,passes request next services
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */
exports.login = (req, res) => {
    try {
        req.checkBody('email', 'email invalid').isEmail()
        req.checkBody('password', 'password invalid').isLength({ min: 8 })
        let errors = req.validationErrors();
        if (errors) {
            response.data = null
            response.errors = errors
            response.sucess = false
            res.status(status.UnprocessableEntity).send(response);
        }
        else {
            services.login(req, (err, data) => {
                if (err) {
                    response.data = null
                    response.errors = err
                    response.sucess = false
                    res.status(status.notfound).send(response);

                } else {
                    let log = {}
                    log.data = data
                    token.generateToken(data._id, (err, token) => {
                        log.token = token
                        if (err) {
                            response.data = null
                            response.errors = err
                            response.sucess = false
                            res.status(status.notfound).send(response);
                        } else {
                            let userId = data._id
                            model.getNotes(userId)
                                .then(noteData => {

                                    if (noteData.length > 0) {
                                        elastic.addDocument(noteData)
                                        let array = noteData.filter(ele => ele.isTrash !== true && ele.isArchive !== true)
                                        details.id = noteData[0].userId
                                        details.value = array
                                        rediscache.setRedis(details, (err, set) => {
                                            if (err) {
                                                console.log("cache not stored")
                                            } else {
                                                response.errors = null
                                                response.data = log
                                                response.sucess = true
                                                res.status(status.sucess).send(response);
                                            }
                                        })
                                    }
                                    else {
                                        response.errors = null
                                        response.data = log
                                        response.sucess = true
                                        res.status(status.sucess).send(response);
                                    }


                                })
                                .catch(err => {

                                    response.errors = err
                                    response.data = null
                                    response.sucess = false
                                    res.status(status.notfound).send(response);
                                })
                        }
                    })
                }
            })
        }




    } catch (e) {
        console.log(e);
    }

}
/**
 * @desc takes input ,error validation is done,passes request next services
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */

exports.forgotPassword = (req, res) => {
    try {
        req.checkBody('email', 'email invalid').isEmail()
        let errors = req.validationErrors();
        if (errors) {
            response.data = null
            response.errors = errors
            response.sucess = false
            res.status(status.UnprocessableEntity).send(response);
        }
        else {
            services.forgotpassword(req, (err, data) => {
                if (err) {
                    response.data = null
                    response.errors = err
                    response.sucess = false
                    res.status(status.notfound).send(response);
                }
                else {
                    token.generateToken(data._id, (err, token) => {
                        if (err) {
                            response.data = null
                            response.errors = err
                            response.sucess = false
                            res.status(status.notfound).send(response);
                        }
                        else {
                            data.value = token;
                            data.id = data._id;
                            mail.sendmail(data.email, (`${process.env.URL}resetPassword/?token=${token}`), (err, mail) => {
                                if (err) {
                                    response.data = null
                                    response.errors = err
                                    response.sucess = false
                                    res.status(status.notfound).send(response);
                                } else {
                                    mail.token = token
                                    response.data = mail
                                    response.errors = null
                                    response.sucess = true
                                    rediscache.setRedis(data, (err, data) => {
                                        if (err) {
                                            console.log("token not instered to cache");
                                        } else {
                                            res.status(status.sucess).send(response);

                                        }
                                    })

                                }
                            })

                        }
                    })
                }

            })
        }


    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc takes input ,error validation is done,passes request next services
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */
exports.resetPassword = (req, res) => {
    try {

        req.checkBody('password', 'password is not valid').isLength({ min: 8 })
        req.checkBody('confirmPassword', 'confirmPassword is not valid').isLength({ min: 8 })
        let errors = req.validationErrors();
        if (errors) {

            response.data = null
            response.errors = errors
            response.sucess = false
            res.status(422).send(response);
        }
        else {
            if (req.body.password == req.body.confirmPassword) {

                services.resetPassword(req, (err, data) => {

                    if (err) {
                        response.data = null
                        response.errors = err + " id mismatch"
                        response.sucess = false
                        res.status(404).send(response);
                    }
                    else {
                        response.data = data
                        response.errors = null
                        response.sucess = true
                        res.status(200).send(response)
                    }
                })
            }
            else {
                response.data = null
                response.errors = "Passwords mis match"
                response.sucess = false
                res.status(404).send(response);
            }
        }
    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc takes input ,error validation is done,passes request next services
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */
exports.userCheck = (req, res) => {
    try {
        services.find(req)
            .then(data => {
                response.data = data
                response.errors = null
                response.sucess = true
                res.status(200).send(response);

            })

            .catch(err => {
                response.data = null
                response.errors = err
                response.sucess = false
                res.status(404).send(response);

            })

    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc takes input ,error validation is done,passes request next services
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */
exports.checkCollaborated = (req, res) => {
    try {

        services.checkCollaborate(req)
            .then(data => {
                response.data = data
                response.errors = null
                response.sucess = true
                res.status(200).send(response);

            })

            .catch(err => {
                response.data = null
                response.errors = err
                response.sucess = false
                res.status(404).send(response);

            })

    } catch (e) {
        console.log(e)
    }
}


/**
 * @desc takes input ,error validation is done,passes request next services
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */
exports.fileUpload = (req, res) => {
    try {
        console.log("file" + req.file.location)
        services.fileUpload(req, (err, data) => {
            if (err) {
                response.data = null
                response.errors = err
                response.sucess = false
                res.status(404).send(response);
            }
            else {

                response.data = data
                response.errors = null
                response.sucess = true
                res.status(200).send(response);
            }
        })
    } catch (e) {
        console.log(e)
    }
}


