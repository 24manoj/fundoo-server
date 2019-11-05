var mailer = require('nodemailer')
/**
 * @desc sends mail using nodemailer to given email
 * @param mailReciver contains email of reciver
 * @return  callback function with err or data
 */
exports.sendmail = (mailReciver, value, callback) => {
    /** Authorzing transpoter */
    const transpoter = mailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.USEREMAIL,
            pass: process.env.PASS
        }
    });
    const mailoptions = {
        from: process.env.USER,
        to: mailReciver,
        subject: "Reset passowrd",
        text: value
    }
    transpoter.sendMail(mailoptions, (err, mail) => {
        err ? callback(err) : callback(null, mail);
    })
}
/**
 * @desc sends invitelink to collaborated mail
 * @param mail contains request from frontend
 * @return  callback function with err or data
 */
exports.sendHtmlMailer = (mail, callback) => {
    var transpoter = mailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.USEREMAIL,
            pass: process.env.PASS
        }
    });
    var mailoptions = {
        from: process.env.DOMAIN,
        to: mail.email,
        subject: "note collaborating",
        html: '<h1>Hi,</h1><h3> Your friend collaborated a note with you click to view</h3><br><a href="http://localhost:3000/"><button style="{color:orange}"> Open Fundoooo</button>'
    }

    transpoter.sendMail(mailoptions, (err, mail) => {
        err ? callback(err) : callback(null, mail);
    })
}