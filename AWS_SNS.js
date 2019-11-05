// Load the AWS SDK for Node.js
require('dotenv').config();
const AWS = require('aws-sdk');

exports.notification = (details) => {
    try {
        console.log("notification", details);
        return new Promise((resolve, reject) => {
            AWS.config.getCredentials((err) => {
                if (err) {
                    console.log(err);

                } else {
                    console.log(AWS.config.credentials)
                }
            })
            // Set region
            AWS.config.update({ region: 'us-east-2' });
            // console.log("Topic", process.env.AWS_TOPIC_ARN);

            // Create publish parameters
            let params = {
                Message: `You have a reminder note with title: ${details.title} and description : ${details.content}`, /* required */
                TopicArn: process.env.AWS_TOPIC_ARN
            };

            // Create promise and SNS service object
            let publishTextPromise = new AWS.SNS().publish(params).promise();

            // Handle promise's fulfilled/rejected states
            publishTextPromise.then(
                function (data) {
                    resolve(data)
                    console.log(`message ${params.Message} send sent to the topic ${params.TopicArn}`);
                    console.log("MessageID is ", data.MessageId);
                }).catch(
                    function (err) {
                        reject(err)
                        console.error(err, err.stack);
                    });
        })
    } catch (err) {
        console.log(err);

    }
}

