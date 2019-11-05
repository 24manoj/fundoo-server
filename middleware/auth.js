var webtoken = require('./token')
var response = {}
/**
 * @desc verifies whether given token is valid or invalid
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @param next if token is valid,pass control contoler
 * @return return respose sucess or failure
 */
exports.verify = (req, res, next) => {
    webtoken.verifyToken(req.params.token, (err, result) => {
        if (err) {
            response.data = null
            response.errors = err
            response.sucess = false
            res.status(422).send(response)
        }
        else {
            req.decoded = result
            next()
        }
    })
}

/**
 * @desc verifies whether given token is valid or invalid
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @param next if token is valid,pass control contoler
 * @return return respose sucess or failure
 */
exports.verifyUser = (req, res, next) => {
    console.log('in', req.headers.token);

    webtoken.verifyToken(req.headers.token, (err, result) => {
        if (err) {
            response.data = null
            response.errors = err
            response.sucess = false
            res.status(422).send(response)
        }
        else {
            req.decoded = result
            next()
        }
    })
}
