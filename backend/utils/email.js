const nodemailer = require('nodemailer');



const transporter = nodemailer.createTransport({

    service: 'gmail',

    auth: {

        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASS,

    },

});



const sendResetEmail = (email, token) => {

    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    const mailOptions = {

        from: process.env.EMAIL_USER,

        to: email,

        subject: 'Password Reset',

        text: `Click the link to reset your password: ${resetLink}`,

    };



    transporter.sendMail(mailOptions, (err, info) => {

        if (err) {

            console.log(err);

        } else {

            console.log('Email sent: ' + info.response);

        }

    });

};



module.exports = { sendResetEmail };