const elasticsearch = require('elasticsearch');
/**
 * @desc creates a connection for elasticsearch client
 */
const client = new elasticsearch.Client({
    host: process.env.HOST
});
/**
 * @desc creates index for search
 * @param req request contains http request from frontend
 * @param callback passes request back to invoked function
 * @return callback function err or data
 */
exports.checkExist = (req, callback) => {
    try {

        let index = req.decoded.id
        client.indices.exists({ index: index })
            .then(exist => callback(null, exist))
            .catch(err => console.log("indexerr")
            )

    } catch (e) {
        console.log(e)
    }
}

/**
 * @desc creates index for search
 * @param req request contains http request from frontend
 * @param callback passes request back to invoked function
 * @return callback function err or data
 */
exports.createIndex = (req, callback) => {
    try {

        let index = req.decoded.id
        client.indices.create({
            'index': index
        }, ((err, result, status) => {
            err ? callback(err) : callback(null, result)
        }))
    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc  deletes  created index
 * @param req request contains http requested data
 */
exports.Documentdelete = (req) => {
    try {
        client.indices.delete({ index: req.decoded.id })
            .then(data => {
                console.log("document deleted")
                this.createIndex(req, (err, created) => {
                    if (err) {
                        console.log("document");
                    }
                    else {
                        console.log("created")
                    }
                })
            })
            .catch(err => console.log("no documents to delete"))
    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc  adds details to searchdocument
 * @param req request contains http requested data
 */
exports.addDocument = (req) => {
    try {
        let bulk = [];
        console.log("in add elastic")
        req.forEach((element, key) => {
            bulk.push({
                index: {
                    _index: element.userId,
                    _type: "notes"
                }
            })
            let data = {
                "id": element._id,
                "title": element.title,
                "content": element.content,
                "labels": element.labels,
                "color": element.color,
                "reminder": element.reminder,
                "isTrash": element.isTrash,
                "isArchive": element.isArchive,
                "index": element.index
            }
            bulk.push(data)

        });
        //perform bulk indexing of the data passed

        client.bulk({ body: bulk }, (err, response) => {
            err ? console.log("failed operation", err) : console.log("sucessfully inserted to search")
        });
    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc used wildcard to search for given charatcters
 * @param req request contains http requested data
 * @param callback calls invoked function with err or data
 */
exports.searchkey = (req, callback) => {
    try {
        console.log("search", req.body);

        let body = {
            query: {
                query_string: {
                    query: `*${req.body.search}*`,
                    analyze_wildcard: true,
                    fields: ["title", "content", "labels", "id", "reminder", "color"]
                }
            }
        }
        client.search({ index: req.decoded.id, body: body, type: 'notes' })
            .then(searchresult => {

                callback(null, searchresult)
            })
            .catch(err => {
                callback(null, [])
            })
    } catch (e) {
        // console.log(e)
    }
}