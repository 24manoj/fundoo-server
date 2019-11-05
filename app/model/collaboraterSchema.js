let mongoose = require('mongoose')
/**@description schema for collaborate */
const collaborateData = mongoose.Schema({
    noteId: {
        type: String,
        unique: true
    },
    collaborateId: [{
        type: String
    }], userId: {
        type: String
    }
})
exports.colldata = mongoose.model("collaborates", collaborateData)