import { render } from '@react-email/render';
import nodemailer from 'nodemailer';
import type SMTPConnection from 'nodemailer/lib/smtp-connection';
import { Queue } from 'quirrel/remix';
import { SmtpConfig } from '~/smtp.server';
import { Email } from '~/templates/request_mention';

/*

Someone mentioned on a request/comment.

*/

export default Queue('/queues/email/request_mention', async (job, meta) => {
  console.log('email sending');
  const { request, user, mention } = job;

  // console.log(request);
  // async..await is not allowed in global scope, must use a wrapper
  async function main() {
    const transporter = nodemailer.createTransport(SmtpConfig);

    const emailHtml = render(
      <Email request={request} user={user} mention={mention} />,
    );

    let info = await transporter.sendMail({
      from: `"${process.env.SMTP_SENDER_NAME}" <${process.env.SMTP_SENDER_EMAIL}>`,
      to: `${mention.email}`, // list of receivers
      subject: `${user.firstName} ${user.lastName} mentioned you.`,
      html: emailHtml,
    });

    console.log('Message sent: %s', info.messageId);
  }

  main().catch(console.error);
});
