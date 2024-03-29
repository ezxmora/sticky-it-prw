const email = require('nodemailer');

const sendMail = async (to, mailinfo) => {
    const credentials = process.env.MAIL.split(',');
    let account = await email.createTransport({
        service: 'gmail',
        secure: false,
        auth: {
            user: credentials[0],
            pass: credentials[1],

        }
    });

    let info = await account.sendMail({
        from: `"RemindMe 📝" <${credentials[0]}>`,
        to: to.email,
        subject: mailinfo.subject,
        text: mailinfo.text,
        html: mailinfo.html
    });
}

module.exports = {
    register: (to) => {
        sendMail(to, {
            text: `¡Bienvenid@ a RemindMe ${to.username}!\n
                   Nos alegra que hayas decicido confiar en nosotros para administrar tus notas y recordatorios.`,

            html: `<h1>¡Bienvenid@ a RemindMe ${to.username}!</h1>
                   <p>Nos alegra que hayas decicido confiar en nosotros para administrar tus notas y recordatorios.</p>`,
            subject: 'Gracias por registrarte en RemindMe'
        }).catch(err => console.log(err));
    },

    reminder: (to, note) => {
        sendMail(to, note).catch(err => console.log(err));
    }
}