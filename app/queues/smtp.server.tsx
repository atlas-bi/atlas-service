import nodemailer from 'nodemailer';
import type SMTPConnection from 'nodemailer/lib/smtp-connection';
import { Queue } from 'quirrel/remix';

// triggered by user refresh when it completes.
export default Queue('/queues/smtp', async (job, meta) => {
    console.log('email sending');
    console.log(meta);

    // async..await is not allowed in global scope, must use a wrapper
    async function main() {
        const config: SMTPConnection.Options = {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 25),
            secure: process.env.SMTP_TLS === 'true',
        };

        if (
            typeof process.env.SMTP_USERNAME === 'string' &&
            process.env.SMTP_USERNAME.length > 0
        ) {
            config.auth = {
                user: process.env.SMTP_USERNAME,
                pass: process.env.SMTP_PASSWORD,
            };
        }
        console.log(config);
        const transporter = nodemailer.createTransport(config);

        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: '"Fred Foo 👻" <foo@example.com>', // sender address
            to: 'bar@example.com, baz@example.com', // list of receivers
            subject: 'Hello ✔', // Subject line
            text: 'Hello world?', // plain text body
            html: '<b>Hello world?</b>', // html body
        });

        console.log('Message sent: %s', info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }

    main().catch(console.error);
});
