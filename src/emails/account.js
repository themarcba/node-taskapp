const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'no-reply@marc.dev',
        subject: 'Welcome to TaskApp 🎉',
        text: `Thanks for joining TaskApp, ${name}. I hope you enjoy this service!`
    })
}

const sendByeMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'bye@marc.dev',
        subject: 'Bye bye 😢',
        text: `Thanks for having used, ${name}. Is there anything I could have done to keep you onboard? If yes, respond to this e-mail and I'll try to fix things for future users.\n\nBest regards,\n\nMarc from TaskApp`
    })
}

module.exports = { sendWelcomeMail, sendByeMail }