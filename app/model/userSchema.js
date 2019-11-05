let mongoose = require('mongoose')
let registration = new mongoose.Schema({
    "firstName": {
        type: String,
        required: true
    },
    "lastName":
    {
        type: String
    },
    "email":
    {
        type: String,
        required: true,
        unique: true
    }
    , "password":
    {
        type: String
    },
    "provider": {
        type: String
    }, "url":
    {
        type: String
    }

}, {
    timestamps: true
})
exports.userRegistration = mongoose.model('userRegistration', registration);
