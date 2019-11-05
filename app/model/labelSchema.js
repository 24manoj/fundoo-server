let mongoose = require('mongoose')
/** @description schema for storing labels in database */
const label = new mongoose.Schema
    ({
        "userId": {
            type: String,
            required: true
        },
        "labelName": {
            type: String,
            required: true
        }
    }, {
        timestamps: true
    })
exports.labels = mongoose.model("label", label)