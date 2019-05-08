const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice'); //allow style text like css 
const htmlToText = require('html-to-text'); // to allow email to receive HTML like <strong>
const promisify = require('es6-promisify');

const transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

// // Just to test y-you do the following
// transport.sendMail({
//     from: 'Adrien <adrien@gmail.com>',
//     to: 'yolo@example.com',
//     subject: 'just try it is working',
//     html: 'hey I <strong>love</strong> you',
//     text: 'Hey I **love you**'
// });

// // TO test you export in app.js comme suit and check your inbox
// // !!!!!!! delete then 
// // ==> 
// require('./handlers/mail');

const generateHTML = (filename, options = {}) => {
    const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`,
     options);
     const inlined = juice(html); // active the css style
     return inlined;
};

exports.send = async (options) => {
    const html = generateHTML(options.filename, options); // reference à la ligne 31 -32
    const text =  htmlToText.fromString(html); // To allow the email to receive HTML like <strong>
    const mailOptions = {
    from: 'Adrien <adrien@gmail.com>',
    to: options.user.email,
    subject: options.subject,
    html: html, // possibility to write only html, 
    text: text, 
    };
    const sendMail = promisify(transport.sendMail, transport);
    return sendMail(mailOptions);
};

// VOIR le mail pug to see how to interpolate the dat in the mail