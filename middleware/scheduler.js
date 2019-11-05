let scheuler = require('node-schedule')
let AWS = require('../AWS_SNS')
let services = require('../services/notesService')

/**
 * @desc scheduler checks every minute for give job,triggers if it matches given time and date
 */

exports.scheduleReminder = (req) => {
    try {
        let details;
        return new Promise((resolve, reject) => {
            let date = new Date(req.body.reminder)
            scheuler.scheduleJob(date, () => {
                services.findNote(req)
                    .then(data => {
                        AWS.notification(data)
                            .then(sent => {
                                console.log("mail sent ,,,", sent);
                            })
                            .catch(err => {
                                console.log("err", err);
                            })
                    })
            })

        })
    } catch (err) {
        console.log(err);

    }
}