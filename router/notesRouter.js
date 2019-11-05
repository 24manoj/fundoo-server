let noteRouter = require('express').Router();
let auth = require('../middleware/auth')
let notesController = require('../controller/notescontroller')
let services = require('../services/notesService')
/** @description routes to specified endPoints */
noteRouter.post('/createNotes', auth.verifyUser, notesController.createNotes);
noteRouter.get('/getNotes', auth.verifyUser, notesController.getNotes)
noteRouter.get('/getArchiveNotes', auth.verifyUser, notesController.getArchiveNotes)
noteRouter.get('/getTrashNotes', auth.verifyUser, notesController.getTrashNotes)
noteRouter.put('/updateNotes', auth.verifyUser, notesController.updateNotes);
noteRouter.put('/deleteNotes', auth.verifyUser, notesController.deleteNotes)
noteRouter.put('/noteTrash', auth.verifyUser, notesController.noteTrash);
noteRouter.put('/noteUnTrash', auth.verifyUser, notesController.noteUnTrash);
noteRouter.put('/noteArchive', auth.verifyUser, notesController.noteArchive);
noteRouter.put('/noteUnArchive', auth.verifyUser, notesController.noteUnArchive);
noteRouter.put('/noteReminder', auth.verifyUser, notesController.noteReminder);
noteRouter.put('/noteUndoReminder', auth.verifyUser, notesController.noteUndoReminder);
noteRouter.put('/noteLabel', auth.verifyUser, notesController.noteLabel);
noteRouter.put('/noteUndoLabel', auth.verifyUser, notesController.noteUndoLabel);
noteRouter.post('/createLabel', auth.verifyUser, notesController.createLabel)
noteRouter.post('/deleteLabel', auth.verifyUser, notesController.deleteLabel)
noteRouter.put('/updateLabel', auth.verifyUser, notesController.updateLabel)
noteRouter.get('/getLabels', auth.verifyUser, notesController.getLabels)
noteRouter.post('/addCollaborate', auth.verifyUser, notesController.addCollaborate)
noteRouter.put('/removeCollaborate', auth.verifyUser, notesController.removeCollaborate)
noteRouter.put('/updateColor', auth.verifyUser, notesController.updateColor)
noteRouter.put('/updateIndex', auth.verifyUser, services.updateIndex)
noteRouter.put('/updateCollabarate', auth.verifyUser, services.updateCollaborate)

module.exports = noteRouter