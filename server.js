/********************************************************************************************************************
 * @Execution : default nodemon : cmd> server.js
 * @Purpose : learn backend using node
 * @description : Using nodejs,express build backend api,login,register,reset,forgot  
 * @overview : fundoo
 * @author : manoj kumar k s<manoj.ks.24.mk@gmail.com>
 * @version : 1.0
 * @since : 21-aug-2019
 *******************************************************************************************************************/
//importing  modules
require('dotenv').config();
const reminderNotes = require('./services/notesService')
const scheduler = require('node-schedule')
const authverify = require('./middleware/auth')
const express = require('express');
const expressvalidator = require('express-validator');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const routes = require('./router/router');
const notesRoutes = require('./router/notesRouter')
let search = require('./router/elasticSearchRouter')
let cors = require('cors')
const passport = require('passport')
let auth = require('./router/auth');
const app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true
}))
app.use(cors());
app.use(express.static('../client'))
app.use(expressvalidator())
app.use(passport.initialize());
app.use(passport.session());
//allow OPTIONS on just one resource
// app.options('http://localhost:3000/*', cors())

//allow OPTIONS on all resources
// app.options('*', cors())
app.use('/auth', auth);
app.use('/', routes)
app.use('/elastic', search)
app.use('/note', notesRoutes)
//creating connection for mongodb
mongoose.connect("mongodb://localhost:27017/fundoo", { useCreateIndex: true, useNewUrlParser: true })
//event Emiters
mongoose.connection.on("connected", () => {
    console.log("Database connected sucessfully");
})
mongoose.connection.on("disconnected", () => {
    console.log("database Disconnected");
    process.exit(0)
})
mongoose.connection.on("error", () => {
    console.log("database could not be connected")
    process.exit(1)
})

app.listen(process.env.PORT, () => {
    console.log("Running sucessfully on port ", process.env.PORT)
})

module.exports = app;