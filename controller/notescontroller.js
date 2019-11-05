let noteService = require('../services/notesService')
let status = require('../middleware/httpStatusCode')
let userService = require('../services/userService')
let redisCache = require('../middleware/redisService')
let elastic = require('../middleware/elasticSearch')
let model = require('../services/userService')
require('dotenv').config()
let scheduler = require('../middleware/scheduler')
let mailer = require('../middleware/userMailer')
let response = {};
let details = {};

/**
 * @desc takes input as http req ,error validation is done,passes request data to  next services
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */
exports.createNotes = (req, res) => {
    try {
        if (req.body.title != null || req.body.content != null) {
            elastic.Documentdelete(req)
            details.id = req.decoded.id
            redisCache.delRedis(details, (err, cacheDelete) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log(cacheDelete)
                }
            })
            noteService.createNotes(req)
                .then(data => {
                    if (req.body.collaborate.length > 0) {
                        let payload = {
                            userId: req.decoded.id,
                            noteId: data._id,
                            collaborate: req.body.collaborate,
                            id: req.decoded.id
                        }
                        this.addCollaborate(payload, res)
                            .then(coldata => {
                                let payload = {
                                    noteId: data._id,
                                    collId: coldata._id
                                }
                                noteService.addCollId(payload)
                                    .then(updated => {
                                        console.log("updated");

                                    })
                                    .catch(err => {
                                        console.log(err);

                                    })
                            })
                            .catch(er => {
                                console.log(err);

                            })
                    }
                    if (req.body.reminder !== undefined) {
                        scheduler.scheduleReminder(req)
                    }
                    response.sucess = true,
                        response.data = data,
                        response.errors = null
                    res.status(status.sucess).send(response)
                })


                .catch((err) => {
                    response.sucess = false,
                        response.data = null,
                        response.errors = err
                    res.status(status.notfound).send(response)
                })
        }
        else {
            response.sucess = true,
                response.data = "no data",
                response.errors = null
            res.status(status.sucess).send(response);
        }

    } catch (e) { console.log(e) }
}

/**
 * @desc takes input as http req ,error validation is done,passes request data to  next services
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */
exports.updateColor = async (req, res) => {
    try {
        await elastic.Documentdelete(req)
        details.id = req.decoded.id
        redisCache.delRedis(details, (err, cacheDelete) => {
            if (err) {
                console.log(err)
            } else {
                console.log(cacheDelete)
            }
        })
        noteService.updateColor(req)
            .then(data => {
                response.sucess = true,
                    response.data = data,
                    response.errors = null
                console.log(response)
                res.status(status.sucess).send(response)
            })
            .catch((err) => {
                response.sucess = false,
                    response.data = null,
                    response.errors = err
                console.log(err)
                res.status(status.notfound).send(response)
            })



    } catch (e) { console.log(e) }
}

/**
 * @desc takes input as http req ,error validation is done,passes request data to  next services,
 * respoonses with array of notes
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */

exports.getTrashNotes = (req, res) => {
    try {

        noteService.getTrashNotes(req.decoded.id)
            .then(notes => {

                response.sucess = true,
                    response.data = notes,
                    response.errors = null
                res.status(status.sucess).send(response)

            })
            .catch(err => {
                response.sucess = false,
                    response.data = null,
                    response.errors = err
                res.status(status.notfound).send(response)
            })
   

    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc takes input as http req ,error validation is done,passes request data to  next services,
 * respoonses with array of notes
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */

exports.getArchiveNotes = (req, res) => {
    try {
        noteService.getArchiveNotes(req.decoded.id)
            .then(notes => {
                response.sucess = true,
                    response.data = notes,
                    response.errors = null
                res.status(status.sucess).send(response)
            })
            .catch(err => {
                response.sucess = false,
                    response.data = null,
                    response.errors = err
                res.status(status.notfound).send(response)
            })

    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc takes input as http req ,error validation is done,passes request data to  next services,
 * respoonses with array of notes
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */

exports.getNotes = (req, res) => {
    try {
        details.id = req.decoded.id
        details.value = []
        redisCache.getRedis(details, (err, data) => {
            if (data) {
                response.sucess = true,
                    response.data = data,
                    response.errors = null
                res.status(status.sucess).send(response)
            } else {
                noteService.getNotes(req.decoded.id)
                    .then(notes => {
                        elastic.addDocument(notes)
                        let array = notes.filter(ele => ele.isTrash !== true && ele.isArchive !== true)
                        details.id = req.decoded.id
                        details.value = array
                        redisCache.setRedis(details, (err, data) => {
                            if (data) {
                                response.sucess = true,
                                    response.data = array,
                                    response.errors = null
                                res.status(status.sucess).send(response)
                            }
                        })
                    })

                    .catch(err => {
                        response.sucess = false,
                            response.data = null,
                            response.errors = err
                        res.status(status.notfound).send(response)
                    })


            }

        })
    } catch (e) {
        console.log(e)
    }
}


/**
 * @desc takes input as http req ,error validation is done,passes request data to  next services,
 *  updates collection with valid details
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */

exports.updateNotes = (req, res) => {
    try {
        req.check('noteId', 'NoteId invalid').notEmpty()
        let errors = req.validationErrors()
        if (errors) {
            response.sucess = false,
                response.data = null,
                response.errors = errors
            res.status(status.UnprocessableEntity).send(response)
        } else {
            elastic.Documentdelete(req)
            details.id = req.decoded.id
            redisCache.delRedis(details, (err, dele) => {
                if (err) {
                    throw new "error  in catch"
                } else {
                    noteService.updateNotes(req)
                        .then((notes) => {
                            response.sucess = true,
                                response.data = notes,
                                response.errors = null
                            res.status(status.sucess).send(response)
                        })
                        .catch(err => {
                            response.sucess = false,
                                response.data = null,
                                response.errors = err
                            res.status(status.notfound).send(response)
                        })
                }
            })

        }
    } catch (e) { console.log(e) }
}

/**
 * @desc takes input as http req ,error validation is done,passes request data to  next services,
 * removes  data from collection
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */

exports.deleteNotes = (req, res) => {
    try {
        req.check('noteId', 'id invalid').notEmpty()
        let errors = req.validationErrors()
        if (errors) {
            response.errors = errors
            response.data = null
            response.sucess = false
            res.status(status.UnprocessableEntity).send(response)
        }
        else {
            details.id = req.decoded.id
            redisCache.delRedis(details, (err, del) => {
                if (err) {
                    throw new err
                }
                else {
                    elastic.Documentdelete(req)
                    noteService.deleteNotes(req)
                        .then(data => {
                            response.errors = null
                            response.data = data
                            response.sucess = true
                            res.status(status.sucess).send(response)
                        })
                        .catch(err => {
                            response.errors = err
                            response.data = null
                            response.sucess = false
                            res.status(status.notfound).send(response)
                        })
                }
            })
        }
    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc takes input as http req ,error validation is done,passes request data to  next services,
 * updates collection with isTrash to false
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */

exports.noteUnTrash = (req, res) => {
    try {
        req.check('noteId', 'Id invalid').notEmpty()
        let errors = req.validationErrors()
        if (errors) {
            response.errors = errors
            response.data = null
            response.sucess = false
            res.status(status.UnprocessableEntity).send(response)
        }
        else {
            details.id = req.decoded.id
            redisCache.delRedis(details, (err, deleted) => {
                if (err) {
                    throw new "error in radis", err;
                } else {
                    elastic.Documentdelete(req)
                    noteService.noteUnTrash(req)
                        .then(data => {
                            response.errors = null
                            response.data = data
                            response.sucess = true
                            res.status(status.sucess).send(response);
                        })
                        .catch(err => {
                            response.errors = err
                            response.data = null
                            response.sucess = false
                            res.status(status.notfound).send(response)
                        })
                }
            })
        }

    } catch (e) {
        console.log(e)
    }
}

/**
 * @desc takes input as http req ,error validation is done,passes request data to  next services,
 * updates collection with isTrash true
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */

exports.noteTrash = (req, res) => {
    try {
        req.check('noteId', 'Id invalid').notEmpty()
        let errors = req.validationErrors()
        if (errors) {
            response.errors = errors
            response.data = null
            response.sucess = false
            res.status(status.UnprocessableEntity).send(response)
        }
        else {
            details.id = req.decoded.id
            redisCache.delRedis(details, (err, deleted) => {
                if (err) {
                    throw new "error in radis", err;
                } else {
                    elastic.Documentdelete(req)
                    noteService.noteTrash(req)
                        .then(data => {
                            response.errors = null
                            response.data = data
                            response.sucess = true
                            res.status(status.sucess).send(response)


                        })
                        .catch(err => {
                            response.errors = err
                            response.data = null
                            response.sucess = false
                            res.status(status.notfound).send(response)
                        })
                }
            })

        }
    } catch (e) {
        console.log(e)
    }
}

/**
 * @desc takes input as http req ,error validation is done,passes request data to  next services,
 * updates collection with archive false
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */

exports.noteUnArchive = (req, res) => {
    try {

        req.check('noteId', 'noteId invalid').notEmpty()
        let errors = req.validationErrors()
        if (errors) {
            response.errors = errors
            response.data = null
            response.sucess = false
            res.status(status.UnprocessableEntity).send(response)
        }
        else {
            details.id = req.decoded.id
            redisCache.delRedis(details, (err, deleted) => {
                if (err) {
                    throw new "error in radis", err;
                } else {
                    elastic.Documentdelete(req)

                    noteService.noteUnArchive(req)
                        .then(data => {
                            response.errors = null
                            response.data = data
                            response.sucess = true
                            res.status(status.sucess).send(response)
                        })
                        .catch(err => {
                            response.errors = err
                            response.data = null
                            response.sucess = false
                            res.status(status.notfound).send(response)
                        })
                }
            })
        }
    } catch (e) {
        console.log(e)
    }
}

/**
 * @desc takes input as http req ,error validation is done,passes request data to  next services,
 * updates collection with verified details
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */

exports.noteArchive = (req, res) => {
    try {

        req.check('noteId', 'noteId invalid').notEmpty()
        let errors = req.validationErrors()
        if (errors) {
            response.errors = errors
            response.data = null
            response.sucess = false
            res.status(status.UnprocessableEntity).send(response)
        }
        else {
            details.id = req.decoded.id;
            redisCache.delRedis(details, (err, del) => {
                if (err) {
                    throw new "error in radis", err;
                } else {
                    elastic.Documentdelete(req)
                    noteService.noteArchive(req)
                        .then(data => {
                            response.errors = null
                            response.data = data
                            response.sucess = true
                            res.status(status.sucess).send(response)
                        })
                        .catch(err => {
                            response.errors = err
                            response.data = null
                            response.sucess = false
                            res.status(status.notfound).send(response)
                        })




                }
            })

        }
    } catch (e) {
        console.log(e)
    }
}




/**
 * @desc takes input as http req ,error validation is done,passes request data to  next services,
 * updates collection with verified details
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */
exports.noteUndoReminder = (req, res) => {
    try {
        elastic.Documentdelete(req)
        details.id = req.decoded.id;
        redisCache.delRedis(details, (err, del) => {
            if (err) {
                throw "error in radis", err;
            } else {
                noteService.noteUndoReminder(req)
                    .then(data => {
                        response.errors = null
                        response.data = data
                        response.sucess = true
                        res.status(status.sucess).send(response)
                    })
                    .catch(err => {
                        response.errors = err
                        response.data = null
                        response.sucess = false
                        res.status(status.notfound).send(response)
                    })
            }
        })
    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc takes input as http req ,error validation is done,passes request data to  next services,
 * updates collection with verified details
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */
exports.noteReminder = (req, res) => {
    try {
        elastic.Documentdelete(req)
        details.id = req.decoded.id;
        redisCache.delRedis(details, (err, del) => {
            if (err) {
                throw new "error in radis", err;
            } else {
                noteService.noteReminder(req)
                    .then(data => {
                        scheduler.scheduleReminder(req)
                        response.errors = null
                        response.data = data
                        response.sucess = true
                        res.status(status.sucess).send(response)
                    })
                    .catch(err => {
                        response.errors = err
                        response.data = null
                        response.sucess = false
                        res.status(status.notfound).send(response)
                    })
            }
        })

    } catch (e) {
        console.log(e)
    }
}


/**
 * @desc takes input as http req ,error validation is done,passes request data to  next services,
 * updates collection with verified details
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */

exports.noteUndoLabel = (req, res) => {
    try {
        req.check('noteId', 'Id invalid').notEmpty()
        req.check('labelId', 'label invalid').notEmpty()
        let errors = req.validationErrors()
        if (errors) {
            response.errors = errors
            response.data = null
            response.sucess = false
            res.status(status.UnprocessableEntity).send(response)
        }
        else {
            elastic.Documentdelete(req)
            details.id = req.decoded.id
            redisCache.delRedis(details, (err, del) => {
                if (err) throw new err
                else {
                    noteService.noteUndoLabel(req)
                        .then(data => {
                            response.errors = null
                            response.data = data
                            response.sucess = true
                            res.status(status.sucess).send(response)
                        })

                        .catch(err => {
                            response.errors = err
                            response.data = null
                            response.sucess = false
                            res.status(status.notfound).send(response)
                        })
                }

            })

        }
    } catch (e) {
        console.log(e)
    }
}


/**
 * @desc takes input as http req ,error validation is done,passes request data to  next services,
 * updates collection with verified details
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */

exports.noteLabel = (req, res) => {
    try {
        req.check('noteId', 'Id invalid').notEmpty()
        let errors = req.validationErrors()
        if (errors) {
            response.errors = errors
            response.data = null
            response.sucess = false
            res.status(status.UnprocessableEntity).send(response)
        }
        else {
            elastic.Documentdelete(req)
            details.id = req.decoded.id
            redisCache.delRedis(details, (err, del) => {
                if (err) throw new err
                else {
                    noteService.noteLabel(req)
                        .then(data => {
                            response.errors = null
                            response.data = data
                            response.sucess = true
                            res.status(status.sucess).send(response)
                        })

                        .catch(err => {

                            response.errors = err
                            response.data = null
                            response.sucess = false
                            res.status(status.notfound).send(response)
                        })
                }

            })

        }
    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc takes input as http req ,error validation is done,passes request data to  next services,
 * collects the data and save in collection
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */

exports.createLabel = async (req, res) => {
    try {
        req.check('labelName', 'labelName invalid').notEmpty()
        let errors = req.validationErrors()
        if (errors) {
            response.errors = errors
            response.data = null
            response.sucess = false
            res.status(status.UnprocessableEntity).send(response)
        }
        else {
            details.id = details.id = `${req.decoded.id}Labels`
            await redisCache.delRedis(details, (err, del) => {
                if (err) {
                    throw new err
                } else {
                    noteService.createLabel(req, (err, data) => {
                        if (data) {
                            response.errors = null
                            response.data = data
                            response.sucess = true
                            res.status(status.sucess).send(response)
                        }
                        else {
                            response.errors = err
                            response.data = null
                            response.sucess = false
                            res.status(status.notfound).send(response)
                        }
                    })
                }
            }
            )
        }
    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc takes input as http req ,error validation is done,passes request data to  next services,
 * updates collection with verified details
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */

exports.updateLabel = async (req, res) => {
    try {
        req.check('id', 'Id invalid').notEmpty()
        req.check('labelName', 'labelName invalid').notEmpty()
        let errors = req.validationErrors()
        if (errors) {
            response.errors = errors
            response.data = null
            response.sucess = false
            res.status(status.UnprocessableEntity).send(response)
        }
        else {


            details.id = details.id = `${req.decoded.id}Labels`

            await redisCache.delRedis(details, (err, del) => {
                if (err) {
                    throw new err
                } else {
                    noteService.updateLabel(req, res)
                        .then(data => {
                            response.errors = null
                            response.data = data
                            response.sucess = false
                            res.status(status.sucess).send(response)

                        })
                        .catch(err => {
                            response.errors = err
                            response.data = null
                            response.sucess = false
                            res.status(status.notfound).send(response)
                        })
                }
            })

        }
    } catch (e) { console.log(es) }
}

/**
 * @desc takes input as http req ,error validation is done,passes request data to  next services,
 * removes documents from collection
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */
exports.deleteLabel = async (req, res) => {
    try {

        req.check('id', "label id invalid").notEmpty()
        //req.check('lableName', 'lableName invalid').notEmpty()
        let errors = req.validationErrors()
        if (errors) {
            response.errors = errors
            response.data = null
            response.sucess = false
            res.status(status.UnprocessableEntity).send(response)
        }
        else {
            details.id = details.id = `${req.decoded.id}Labels`

            await redisCache.delRedis(details, (err, del) => {
                if (err) {
                    throw new err
                } else {
                    noteService.deleteLabel(req)
                        .then(data => {
                            details.id = data._id
                            details.value = data

                            response.errors = null
                            response.data = data
                            response.sucess = true
                            res.status(status.sucess).send(response)

                        })
                        .catch(err => {
                            response.errors = err
                            response.data = null
                            response.sucess = false
                            res.status(status.notfound).send(response)
                        })

                }
            })

        }
    } catch (e) {
        console.log(e)
    }
}

/**
 * @desc takes input as http req ,error validation is done,passes request data to  next services,
 * response with array of labels document
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */
exports.getLabels = async (req, res) => {
    try {

        details.id = `${req.decoded.id}Labels`
        await redisCache.getRedis(details, (err, data) => {
            if (err) {
                noteService.getLabels(req)
                    .then(data => {
                        details.id = `${req.decoded.id}Labels`
                        details.value = data;
                        redisCache.setRedis(details, (err, rdis) => {
                            if (rdis) {
                                response.errors = null
                                response.data = data
                                response.sucess = true
                                res.status(status.sucess).send(response)
                            }
                        })
                    })
                    .catch(err => {
                        response.errors = err
                        response.data = null
                        response.sucess = false
                        res.status(status.notfound).send(response)
                    })

            }
            else {
                response.errors = null
                response.data = data
                response.sucess = true
                res.status(status.sucess).send(response)
            }
        })


    } catch (e) {
        console.log(e)
    }
}

/**
 * @desc takes input as http req ,error validation is done,passes request data to  next services,
 * response with add data  to database
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */
exports.addCollaborate = async (req, res) => {
    try {
        return new Promise((resolve, reject) => {

            let details = {}
            details.id = req.id
            redisCache.delRedis(details, (err, data) => {
                if (err) console.log(err);
                else console.log(data);
            })
            req.collaborate.map(ele =>
                mailer.sendHtmlMailer(ele, (err, sent) => {
                    if (err) {
                        response.errors = err
                        response.data = null
                        response.sucess = false
                        res.status(status.UnprocessableEntity).send(response)
                    } else {
                        req.collId = ele._id
                        noteService.addCollaborate(req)
                            .then(data => {
                                // response.errors = null
                                // response.data = data
                                // response.sucess = true
                                // res.status(status.sucess).send(response)
                                resolve(data)
                            })
                            .catch(err => {
                                // response.errors = err
                                // response.data = null
                                // response.sucess = false
                                // res.status(status.notfound).send(response)
                                reject(err)
                            })

                    }




                })
            )
        })
    } catch (e) {
        console.log(e)
    }
}


/**
 * @desc takes input as http req ,error validation is done,passes request data to  next services,
 * removes documents from collection
 * @param req request contains all the requested data
 * @param res contains response from backend
 * @return return respose sucess or failure
 */

exports.removeCollaborate = (req, res) => {

    let details = {}
    details.id = req.decoded.id
    req.check('noteId', 'noteId invalid').notEmpty()
    req.check('collId', 'collaborateId in valid').notEmpty()
    let errors = req.validationErrors()
    redisCache.delRedis(details, (err, data) => {
        if (err) console.log(err);
        else console.log(data);

    })
    if (errors) {
        response.err = errors
        response.data = null
        response.sucess = false
        res.status(status.UnprocessableEntity).send(response)
    } else {
        console.log("body", req.body);

        noteService.findNote(req)
            .then(found => {
                let payload = {
                    collaborateId: found.collaborated[0],
                    collId: req.body.collId
                }
                userService.removeCollaborate(payload)
                    .then(removed => {

                        response.err = null
                        response.data = removed
                        response.sucess = true
                        res.status(status.sucess).send(response)
                    })
                    .catch(err => {

                        response.err = err
                        response.data = null
                        response.sucess = false
                        res.status(status.notfound).send(response)
                    })
            })

        // noteService.removeCollaborate(req)
        //     .then(removed => {
        //         response.err = null
        //         response.data = removed
        //         response.sucess = true
        //         res.status(status.sucess).send(response)
        //     }).catch(err => {
        //         response.err = err
        //         response.data = null
        //         response.sucess = false
        //         res.status(status.notfound).send(response)
        //     })
    }
}