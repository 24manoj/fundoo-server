var jsonToken = require('jsonwebtoken');
/**
 * @desc generates token for the given id,it requires a key to generate
 * @param id request contains data which is used by token generator
 * @param callback callbacks with err or data
 */
exports.generateToken = (id, callback) => {
    try {
        let payload = {
            "id": id
        }
        //sign take payload,secret key ,expire time option,a callback 
        jsonToken.sign(payload, process.env.KEY, { expiresIn: 60 * 60 }, (err, token) => {
            if (err) {
                callback(err);
            } else {
                callback(null, token);
            }

        })
    }
    catch (e) {
        console.log(e)
    }
}

/**
 * @desc takes token and verifies with secret key,validates token is invalid or valid 
 * @param callback  with err or data
 */
exports.verifyToken = (token, callback) => {
    try {
        jsonToken.verify(token, process.env.KEY, (err, result) => {

            if (result != undefined) {
                callback(null, result);
            }
            else {
                callback(`invalid Token ${err}`);
            }
        })

    } catch (e) {
        console.log(e)
    }
}