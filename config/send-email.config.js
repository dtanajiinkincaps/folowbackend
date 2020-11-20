const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
    sendMail(to, subject, message) {
        return new Promise(async (resolve, reject) => {
            // pathToAttachment = `${__dirname}/public/upload/`+image;
            // attachment = fs.readFileSync(pathToAttachment).toString("base64");
            // var url = `http://localhost:4000/verify_email/${random}`
            const msg = {
                from: process.env.SEND_EMAIL_FROM,
                to: to,
                subject: 'Email Verification',
                html : message,
                subject:subject
                // html: `Please Click this link to confirm your email : <a href="${url}">${url}</a>`
                // attachments: [{
                //     content: attachment,
                //     filename: image,
                // }]
            };


            sgMail.send(msg, async function (err, info) {
                if (err) {
                    console.log("Unable send to email to " + to + " | " + err);
                    try {
                        resolve({ status: false, 'error': err });
                    } catch (err) {
                        console.log("!st error workingngng...");
                    }
                } else {
                    console.log("Email is send successfully to " + to);
                    try {
                        resolve({ status: true, 'info': info });
                    } catch (err) {
                        console.log("2nd error workingg....");
                    }
                }
            })

        })
    }
}