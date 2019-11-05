const client = require('../middleware/elasticSearch')
const status = require('../middleware/httpStatusCode')
const notes = require('../services/notesService')
const elastic = require('../middleware/elasticSearch')
let response = {}
/**
 * @desc  validates http requests 
 * @param req request contains http requested data
 * @param res responses back to frontend
 * @return response 
 */
exports.createIndex = (req, callback) => {
    try {
        client.createIndex(req, (err, data) => {
            if (err) {
                callback(err)
                // response.sucess = false
                // response.error = err
                // response.data = null
                // res.status(status.alreadyExist).send(response)
            }
            else {
                callback(null, data)
                // response.sucess = true
                // response.error = null
                // response.data = data
                // res.status(status.sucess).send(response)
            }

        })

    } catch (e) {
        console.log(e)
    }

}

/**
 * @desc  validates http requests
 * @param req request contains http requested data
 * @param res responses back to frontend
 * @return response
 */
exports.search = (req, res) => {
    try {

        client.searchkey(req, (err, data) => {
            if (err) {
                response.sucess = false
                response.error = err
                response.data = null
                res.status(status.notfound).send(response)
            }
            else {
                    response.sucess = true
                    response.error = null
                    response.data = data
                    res.status(status.sucess).send(response)
            
            }
        })
    } catch (e) {
        console.log(e)
    }
}