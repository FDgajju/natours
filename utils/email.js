const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // 1. create transporter.
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    transporter.verify((err, success) => {
      if (err) return console.error(err);
      console.log('Your config is correct 👍️');
    });

    // 2. define the email options.
    const emailOptions = {
      from: '"Gajendra sahu" <hello@gajendra.io>',
      to: options.user,
      subject: options.subject,
      text: options.message,
    };

    // 3 send mail mail.
    const info = await transporter.sendMail(emailOptions);

    return { status: true, info };
  } catch (error) {
    return { status: false, error: error };
  }
};

module.exports = sendEmail;
