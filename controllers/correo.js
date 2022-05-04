const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'imdamian.dev@gmail.com',
        pass: 'K4mk740q',
    },
});

// funcion asincrona que recibe los parametros email, nombre
const send = async (email, nombre) => {
    // con la siguiente configuracion
    let mailOptions = {
        from: 'imdamian.dev@gmail.com',
        to: [email],
        subject: 'Saludos desde la Nasa',
        html: `<h1>Hola ${nombre}, La nasa te da las gracias por subir tu foto a nuestro sistema y colaborar con la nasa</h1>`
    };

    await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = send;