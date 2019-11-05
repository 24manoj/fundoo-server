let elasticRouter = require('express').Router()
let elasticSearch = require('../controller/elasticSearch')
let auth = require('../middleware/auth')
/**@description routes to endpoints */
// elasticRouter.post('/createIndex', auth.verifyUser, elasticSearch.createIndex)
elasticRouter.post('/Search', auth.verifyUser, elasticSearch.search)
// elsticRouter.get('/search', auth.verifyUser, elasticSearch.search)
module.exports = elasticRouter