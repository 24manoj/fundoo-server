/**@description: importing required modules */
const redis = require('redis')
require('dotenv').config()
/**@description: creating client of redis */
const client = redis.createClient()
client.on('error', (err) => {
    console.log("error", err)
})
/**
 * @desc setRedis takes details and stores in redis cache
 * @param details contails data about labels or user
 * @param callback returns err or data to called function
 * @return   promise data resolve or reject
 */
exports.setRedis = (details, callback) => {
    try {
        console.log("in redis")
        /**hmset takes key as string , field and value */
        client.hmset(process.env.REDISKEY, details.id, JSON.stringify(details.value), (err, store) => {
            err ? callback(err) : callback(null, store)
        })
    } catch (e) {
        console.log(e)
    }
}

/**
 * @desc setRedis takes details and stores in redis cache
 * @param details contails data about labels or user
 * @param callback returns err or data to called function
 * @return   promise data resolve or reject
 */
exports.getRedis = (details, callback) => {
    try {
        /**hmset takes key as string , field and value */
        client.hmget(process.env.REDISKEY, details.id, (err, get) => {
            (err || !get[0]) ? callback(`cache error ${err}`) : callback(null, JSON.parse(get))
        })
    } catch (e) {
        console.log(e)
    }
}
/**
 * @desc delRedis search for the given details in cache, if found delete from cache in redis cache
 * @param details contails data about labels or user
 * @param callback returns err or data to called function
 * @return   promise data resolve or reject
 */
exports.delRedis = (details, callback) => {
    try {
        console.log('redis del', details)
        /**hmset takes key as string , field and value */
        client.hdel(process.env.REDISKEY, details.id, (err, del) => {
            err ? callback(err) : callback(null, del);
        })
    } catch (e) {
        console.log(e)
    }
}