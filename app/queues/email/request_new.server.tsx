import { render } from '@react-email/render';
import nodemailer from 'nodemailer';
import type SMTPConnection from 'nodemailer/lib/smtp-connection';
import { Queue } from 'quirrel/remix';
import { SmtpConfig } from '~/smtp.server';
import { Email } from '~/templates/request_new';

/*
New Request Emailer

- you will NOT get an email when you create a request... you already know lol
- if request was created on anothers behalf, notifiy them

*/

// triggered by user refresh when it completes.
export default Queue('/queues/email/request_new', async (job, meta) => {
  const { request } = job;

  async function main() {
    const transporter = nodemailer.createTransport(SmtpConfig);
    const emailHtml = render(<Email request={request} />);
    const info = await transporter.sendMail({
      from: `"${request.creator.firstName} ${request.creator.lastName}" <${request.creator.email}>`,
      to: `${request.requester.email}`, // list of receivers
      subject: 'New Request',
      html: emailHtml,
    });

    console.log('Message sent: %s', info.messageId);
  }

  main().catch(console.error);
});
