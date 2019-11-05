const labelSchema = require('../app/model/labelSchema')
const collSchema = require('../app/model/collaboraterSchema')
const noteSchema = require('../app/model/notesSchema')
let redisCache = require('../middleware/redisService')
let elastic = require('../middleware/elasticSearch')
let userSchema = require('../services/userService')
let mailer = require('../middleware/userMailer')

/**
 * @desc gets validated request from services,performs database operations needed
 * @param req request contains http request
 * @return returns  promise data resolve or reject
 */
exports.createNotes = async (req) => {
    try {
        let countNotes = 0;
        await noteSchema.notes.find().countDocuments((err, count) => {
            countNotes = count + 1;

        })
        return new Promise((resolve, reject) => {
            let noteDetails = new noteSchema.notes({
                "userId": req.decoded.id,
                "title": req.body.title,
                "content": req.body.content,
                "color": req.body.color,
                "isArchive": req.body.Archive,
                "labels": req.body.label,
                "reminder": (req.body.reminder !== undefined ? req.body.reminder + 1 : null),
                "index": countNotes,
            });
            //save data in collection
            noteDetails.save(noteDetails, (err, data) => {
                if (err) { reject(err) }
                else {
                    resolve(data)
                }
            })
        })
    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc gets validated request from services,performs database operations needed
 * @param req request contains http request
 * @return returns  promise data resolve or reject
 */
exports.addCollId = async (req) => {
    try {
        // let countNotes = 0;
        // await noteSchema.notes.find().countDocuments((err, count) => {
        //     countNotes = count + 1;

        // })

        return new Promise((resolve, reject) => {

            noteSchema.notes.updateOne({
                _id: req.noteId
            }, {
                collaborated: req.collId
            }
                , (err, updated) => {
                    if (err) reject(err)
                    else {
                        console.log("note Updated", updated)
                        resolve(updated)
                    }
                })
            // let noteDetails = new noteSchema.notes({
            //     "userId": req.decoded.id,
            //     "title": req.body.title,
            //     "content": req.body.content,
            //     "color": req.body.color,
            //     "isArchive": req.body.Archive,
            //     "labels": req.body.label,
            //     "reminder": (req.body.reminder !== undefined ? req.body.reminder + 1 : null),
            //     "index": countNotes,
            // });
            // //save data in collection
            // noteDetails.save(noteDetails, (err, data) => {
            //     if (err) { reject(err) }
            //     else {
            //         resolve(data)
            //     }
            // })
        })
    } catch (e) {
        console.log(e)
    }
}

/**
 * @desc gets validated request from services,performs database operations needed
 * returns notes data present in database,based on conditions given
 * @param req request contains http request
 * @return returns  promise data resolve or reject
 */
exports.getNotes = async (id) => {
    try {
        // let data = {}
        return new Promise((resolve, reject) => {

            noteSchema.notes.find({
                "userId": id
            }, (err, notes) => {
                if (err) {
                    reject(err)
                }
                else {

                    resolve(notes)
                }
            })



        })



    } catch (e) {
        console.log(e)
    }
}


/**
 * @desc gets validated request from services,performs database operations needed
 * returns notes data present in database,based on conditions given
 * @param req request contains http request
 * @return returns  promise data resolve or reject
 */
exports.getArchiveNotes = (id) => {
    try {
        return new Promise((resolve, reject) => {
            noteSchema.notes.find({
                "userId": id,
                "isTrash": false,
                "isArchive": true,
            }, (err, notes) => {
                (err) ? reject(err) : resolve(notes)
            })
        })
    } catch (e) {
        console.log(e)
    }
}




/**
 * @desc gets validated request from services,performs database operations needed
 * returns notes data present in database,based on conditions given
 * @param req request contains http request
 * @return returns  promise data resolve or reject
 */
exports.updateIndex = (req, res) => {
    try {
        let details = {}
        console.log("source", req.body.source, "destination", req.body.destination);
        elastic.Documentdelete(req)
        details.id = req.decoded.id

        redisCache.delRedis(details, (err, cacheDelete) => {
            if (err) {
                console.log(err)
            } else {
                console.log(cacheDelete)
            }
        })
        noteSchema.notes.updateOne({
            _id: req.body.source.id
        }, {
            'index': req.body.source.index
        }, (err, updated) => {
            if (err) res.status(500).send(err)
            else {
                noteSchema.notes.updateOne({
                    _id: req.body.destination.id
                }, {
                    'index': req.body.destination.index
                }, (err, updated) => {
                    if (err) res.status(500).send(err)
                    else
                        res.status(200).send(updated)
                })
            }

        })

    } catch (e) {
        console.log(e)
    }
}


/**
 * @desc gets validated request from services,performs database operations needed
 * returns notes data present in database,based on conditions given
 * @param req request contains http request
 * @return returns  promise data resolve or reject
 */
exports.updateCollaborate = (req, res) => {
    try {
        let response = {}
        let details = {}
        details.id = req.decoded.id
        redisCache.delRedis(details, (err, data) => {
            if (err) console.log(err);
            else console.log(data);
        })
        req.body.collId.map(ele =>
            mailer.sendHtmlMailer(ele, (err, sent) => {
                if (err) {
                    response.errors = err
                    response.data = null
                    response.sucess = false
                    res.status(422).send(response)
                } else {
                    let payload = {
                        collId: ele._id,
                        noteId: req.body.noteId,
                        userId: req.decoded.id

                    }
                    this.addCollaborate(payload)
                        .then(data => {
                            collSchema.colldata.findOne({
                                noteId: req.body.noteId
                            }, (err, found) => {
                                if (found) {
                                    let payload = {
                                        noteId: req.body.noteId,
                                        collId: found._id
                                    }
                                    this.addCollId(payload)
                                        .then(sucess => {
                                            response.errors = null
                                            response.data = sucess
                                            response.sucess = true
                                            res.status(200).send(response)

                                        })
                                        .catch(err => {
                                            response.errors = err
                                            response.data = null
                                            response.sucess = false
                                            res.status(500).send(response)
                                        })
                                }
                            })

                        })
                        .catch(err => {
                            response.errors = err
                            response.data = null
                            response.sucess = false
                            res.status(500).send(response)
                        })

                }




            })
        )

    } catch (e) {
        console.log(e)
    }
}

/**
 * @desc gets validated request from services,performs database operations needed
 * returns notes data present in database,based on conditions given
 * @param req request contains http request
 * @return returns  promise data resolve or reject
 */
exports.getTrashNotes = (id) => {
    try {
        return new Promise((resolve, reject) => {
            noteSchema.notes.find({
                "userId": id,
                "isTrash": true,
                "isArchive": false,
            }, (err, notes) => {
                (err) ? reject(err) : resolve(notes)
            })
        })
    } catch (e) {
        console.log(e)
    }
}

/**
 * @desc gets validated request from services,performs database operations needed
 * updates collection data for given condition
 * @param req request contains http request
 * @return returns  promise data resolve or reject
 */
exports.updateNotes = (req) => {
    try {
        return new Promise((resolve, reject) => {
            noteSchema.notes.updateOne({
                _id: req.body.noteId
            }, {
                'title': req.body.title,
                'content': req.body.content
            }, (err, updated) => {
                if (err) reject(err)
                else resolve(updated)
            })
        })
    } catch (e) {
        console.log(e)
    }
}

/**
 * @desc gets validated request from services,performs database operations needed
 * updates collection data for given condition
 * @param req request contains http request
 * @return returns  promise data resolve or reject
 */
exports.updateColor = (req) => {
    try {
        return new Promise((resolve, reject) => {
            console.log(req.body.color);

            noteSchema.notes.updateOne({
                _id: req.body.noteId
            }, {
                'color': req.body.color,
            }, (err, updated) => {
                if (err) reject(err)
                else resolve(updated)
            })
        })
    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc gets validated request from services,performs database operations needed
 *  removes data from the collection based on given condition
 * @param req request contains http request
 * @return returns  promise data resolve or reject
 */
exports.deleteNotes = (req) => {
    try {
        return new Promise((resolve, reject) => {
            noteSchema.notes.deleteOne({
                _id: req.body.noteId
            }, (err, deletd) => {
                if (err) reject(err)
                else resolve(deletd)
            })
        })
    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc gets validated request from services,performs database operations needed
 *  updates isTrash attribute for given note id
 * @param req request contains http request
 * @return returns  promise data resolve or reject
 */
exports.noteTrash = (req) => {
    try {
        return new Promise((resolve, reject) => {
            noteSchema.notes.updateOne({
                '_id': req.body.noteId
            }, {
                isTrash: true
            }, (err, updated) => {
                if (err) reject(err)
                else resolve(updated)
            })
        })
    } catch (e) {
        console.log(e)
    }
}

/**
 * @desc gets validated request from services,performs database operations needed
 *  updates isTrash attribute for given note id
 * @param req request contains http request
 * @return returns  promise data resolve or reject
 */
exports.noteUnTrash = (req) => {
    try {
        return new Promise((resolve, reject) => {
            // console.log(req.body.trash)
            noteSchema.notes.update({
                '_id': req.body.noteId
            }, {
                isTrash: false
            }, (err, updated) => {
                if (err) reject(err)
                else resolve(updated)
            })
        })
    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc gets validated request from services,performs database operations needed,
 * updates is Archive attribute ,on given condition
 * @param req request contains http request
 * @return returns  promise data resolve or reject
 */
exports.noteArchive = (req) => {
    try {
        return new Promise((resolve, reject) => {
            noteSchema.notes.updateOne({
                '_id': req.body.noteId
            }, {
                isArchive: true
            }, (err, updated) => {
                if (err) reject(err)
                else resolve(updated)
            })
        })
    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc gets validated request from services,performs database operations needed,
 * updates is Archive attribute ,on given condition
 * @param req request contains http request
 * @return returns  promise data resolve or reject
 */
exports.noteUnArchive = (req) => {
    try {
        return new Promise((resolve, reject) => {
            noteSchema.notes.update({
                '_id': req.body.noteId
            }, {
                isArchive: false
            }, (err, updated) => {
                if (err) reject(err)
                else resolve(updated)
            })
        })
    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc gets validated request from services,performs database operations needed,
 * updates reminder on given condition 
 * @param req request contains http request
 * @return returns  promise data resolve or reject
 */
exports.noteUndoReminder = (req) => {
    try {
        return new Promise((resolve, reject) => {
            noteSchema.notes.updateOne({
                '_id': req.body.noteId
            }, {
                reminder: null,
            }, (err, updated) => {
                if (err) reject(err)
                else resolve(updated)
            })
        })
    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc gets validated request from services,performs database operations needed,
 * updates reminder on given condition 
 * @param req request contains http request
 * @return returns  promise data resolve or reject
 */
exports.findNote = (req) => {
    try {
        return new Promise((resolve, reject) => {
            noteSchema.notes.findOne({
                '_id': req.body.noteId
            }, (err, details) => {
                if (err) reject(err)
                else {
                    resolve(details)
                }
            })
        })
    } catch (e) {
        console.log(e)
    }
}

/**
 * @desc gets validated request from services,performs database operations needed,
 * updates reminder on given condition 
 * @param req request contains http request
 * @return returns  promise data resolve or reject
 */
exports.noteReminder = (req) => {
    try {
        let date = new Date(req.body.reminder)
        return new Promise((resolve, reject) => {
            noteSchema.notes.updateOne({
                '_id': req.body.noteId
            }, {
                reminder: date,
            }, (err, updated) => {
                if (err) reject(err)
                else {

                    resolve(updated)
                }
            })
        })
    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc gets validated request from services,performs database operations needed,
 * pushes Collaborates
 * @param req request contains http request
 * @return returns  promise data resolve or reject
 */
exports.addCollaborate = (req) => {
    try {
        return new Promise((resolve, reject) => {
            collSchema.colldata.findOne({
                noteId: req.noteId
            }, (err, found) => {
                if (err || found == null) {
                    let data = new collSchema.colldata({
                        noteId: req.noteId,
                        userId: req.userId,
                        collaborateId: req.collId
                    })
                    data.save((err, store) => {
                        if (err) {
                            reject(err)
                        }
                        else {

                            resolve(store)
                        }
                    })
                } else {
                    collSchema.colldata.updateOne({
                        noteId: found.noteId
                    }, {
                        $push: {
                            collaborateId: req.collId
                        }
                    }, (err, update) => {
                        if (err) {
                            reject(err)
                        }
                        else {
                            resolve(update)
                        }

                    })
                }

            })

        })
    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc gets validated request from services,performs database operations needed,
 * updates labels attribute on given condition 
 * @param req request contains http request
 * @return returns  promise data resolve or reject
 */
exports.noteUndoLabel = (req) => {
    try {
        return new Promise((resolve, reject) => {
            noteSchema.notes.updateOne({
                _id: req.body.noteId
            }, {
                $pull: {
                    labels: {
                        id: req.body.labelId
                    }
                }

            }, (err, update) => {
                if (err) reject(err)
                else resolve(update)
                // }collId
            })

        })
    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc gets validated request from services,performs database operations needed,
 * updates labels attribute on given condition 
 * @param req request contains http request
 * @return returns  promise data resolve or reject
 */
exports.noteLabel = (req) => {
    try {
        return new Promise((resolve, reject) => {
            noteSchema.notes.updateOne({
                _id: req.body.noteId
            }, {
                $push: {
                    labels: req.body.label
                }
            }, (err, update) => {
                if (err) {
                    console.log("err", err);
                    reject(err)
                }
                else {
                    console.log("updated", update);

                    resolve(update)
                }

            })
        })

    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc gets validated request from services,performs database operations needed,
 * removes added collaboraters
 * @param req request contains http request
 * @return returns  promise data resolve or reject
 */
exports.removeCollaborate = (req) => {
    try {

        return new Promise((resolve, reject) => {
            noteSchema.notes.updateOne({
                _id: req.bodybody.noteId
            }, {
                $pull: { collaborated: req.body.collId }
            }, (err, removed) => {
                console.log(err, removed)
                if (err) reject(err)
                else resolve(removed)
            })
        })
    } catch (e) {
        console.log(e)
    }
}

/**
 * @desc gets validated request from services,performs database operations needed
 *  stores data in collection 
 * @param req request contains http request
 * @return returns  a callback function
 */
exports.createLabel = async (req, callback) => {
    try {
        const data = new labelSchema.labels({
            "userId": req.decoded.id,
            "labelName": req.body.labelName
        })
        await data.save((err, data) => {
            if (err) callback(err)
            else callback(null, data)
        })
    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc gets validated request from services,performs database operations needed
 * updates the changes of label 
 * @param req request contains http request
 * @return returns  promise data resolve or reject
 */
exports.updateLabel = (req) => {
    try {

        return new Promise((resolve, reject) => {
            labelSchema.labels.updateOne({
                '_id': req.body.id
            }, {
                'labelName': req.body.labelName
            }, (err, update) => {
                if (err) reject(err)
                else resolve(update)
            })
        })
    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc gets validated request from services,performs database operations needed,
 * deletes label data for specified label ids
 * @param req request contains http request
 * @return returns  promise data resolve or reject
 */
exports.deleteLabel = (req) => {
    try {
        return new Promise((resolve, reject) => {
            labelSchema.labels.deleteOne({
                '_id': req.body.id
            }, (err, update) => {
                if (err) reject(err)
                else resolve(update)
            })
        })
    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc gets validated request from services,performs database operations needed,
 * finds labels data from database 
 * @param req request contains http request
 * @return returns  promise data resolve or reject
 */
exports.getLabels = (req) => {
    try {
        console.log("get labels", req.decoded.id);

        return new Promise((resolve, reject) => {
            labelSchema.labels.find({
                'userId': req.decoded.id
            }, (err, labels) => {
                if (err) reject(err)
                else {
                    console.log("labels", labels)
                    resolve(labels)
                }
            })
        })
    } catch (e) {
        console.log(e)
    }
}
