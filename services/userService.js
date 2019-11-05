let userSchema = require('../app/model/userSchema')
let bcrypt = require('bcrypt');
let collSchema = require('../app/model/collaboraterSchema')
/**
 * @desc gets validated request from services,performs database operations needed
 * @param req request contains http request 
 * @param callback contains response from backend
 * @return return respose sucess or failure
 */
exports.register = (req, callback) => {
    console.log(req.body.email)
    userSchema.userRegistration.findOne({
        "email": req.body.email
    }, (err, data) => {
        if (data === null) {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                let details = new userSchema.userRegistration({
                    "firstName": req.body.firstName,
                    "lastName": req.body.lastName,
                    "email": req.body.email,
                    "password": hash
                })
                details.save((err, data) => {
                    if (err) {
                        callback(err);
                    }
                    else {
                        callback(null, data);
                    }
                });

            })
        }
        else {
            console.log("err")
            callback("Data exist")
        }
    })
}

/**
 * @desc gets validated request from services,performs database operations needed
 * @param req request contains http request
 * @param callback contains response from backend
 * @return return respose sucess or failure
 */
exports.login = (req, callback) => {
    try {

        userSchema.userRegistration.findOne({
            "email": req.body.email
        }, (err, data) => {
            if (data != null) {
                console.log("data", data);

                bcrypt.compare(req.body.password, data.password, (err, match) => {
                    if (match == false) {
                        callback("password misMatch");
                    }
                    else {

                        callback(null, data)
                    }

                })
            }
            else {

                callback(`Incorrect username and password `);
            }
        })

    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc gets validated request from services,performs database operations needed
 * @param req request contains http request
 * @param callback contains response from backend
 * @return re5500turn respose sucess or failure
 */
exports.forgotpassword = (req, callback) => {
    try {
        userSchema.userRegistration.findOne({
            "email": req.body.email
        }, (err, data) => {
            if (err || data == null) {
                console.log("in module")
                callback("NO data found");
            }
            else {
                callback(null, data);
            }
        })
    } catch (e) {
        console.log(e)
    }
}

/**
 * @desc gets validated request from services,performs database operations needed
 * @param req request contains http request
 * @param callback contains response from backend
 * @return return respose sucess or failure
 */
exports.resetPassword = (req, callback) => {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
            callback(err)
        } else {
            userSchema.userRegistration.updateOne({
                "_id": req.decoded.id
            }, {
                "password": hash
            }, (err, data) => {

                if (err) {

                    callback(err)
                }
                else {
                    callback(null, data)
                }
            })
        }
    })
}


/**
 * @desc gets validated request from services,performs database operations needed
 * @param req request contains http request
 * @param callback contains response from backend
 * @return return respose sucess or failure
 */
exports.fileUpload = (req, callback) => {
    // console.log("request" + req.body);

    try {
        // console.log("req" + req.body);
        userSchema.userRegistration.updateOne({
            "_id": req.decoded.id
        }, {
            "url": req.file.location
        }, (err, data) => {
            if (data) {
                callback(null, req.file.location);
            }
            else {
                callback("Details not updated");
            }
        })
    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc gets validated request from services,performs database operations needed
 * @param req request contains http request
 * @param callback contains response from backend
 * @return return respose sucess or failure
 */
exports.find = (req) => {
    try {
        return new Promise((resolve, reject) => {
            userSchema.userRegistration.findOne({
                "email": req.email !== undefined ? req.email : req.body.email
            }, (err, data) => {
                if (err || data === null) reject("data not exist")
                else resolve(data)
            })
        })

    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc gets validated request from services,performs database operations needed
 * @param req request contains http request
 * @param callback contains response from backend
 * @return return respose sucess or failure
 */
exports.checkCollaborate = (req) => {
    try {
        let count = 0;
        return new Promise((resolve, reject) => {
            collSchema.colldata.findOne({
                _id: req.body.id
            }, (err, found) => {
                if (found) {
                    let colldata = []
                    found.collaborateId.map(ele => {
                        count++;

                        userSchema.userRegistration.findOne({
                            "_id": ele
                        }, (err, data) => {
                            if (err || data === null) reject("data not exist")
                            else {
                                colldata.push(data)
                                if (found.collaborateId.length === count) {
                                    resolve(colldata)
                                }
                            }
                        })

                    })
                    setTimeout(() => {
                        resolve(colldata)
                    }, (3000))
                }
            })
        })

    } catch (e) {
        console.log(e)
    }
}

exports.removeCollaborate = (req) => {
    try {
        console.log("body", req);

        return new Promise((resolve, reject) => {

            collSchema.colldata.updateOne({
                _id: req.collaborateId
            }, {
                $pull: {
                    collaborateId: req.collId
                }
            }, (err, removed) => {
                if (err) reject(err)
                else resolve(removed)

            })
        })
    } catch (err) {
        console.log(err)
    }
}
/**
 * @desc gets validated request from services,performs database operations needed
 * @param req request contains http request
 * @param callback contains response from backend
 * @return return respose sucess or failure
 */
exports.save = (req) => {
    try {
        return new Promise((resolve, reject) => {
            const saveData = new schema.userRegistration(req)
            saveData.save((err, data) => {
                if (data) resolve(data)
                else reject(err)
            })
        })

    } catch (e) {
        console.log(e)
    }
}