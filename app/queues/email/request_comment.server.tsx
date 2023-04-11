import { render } from '@react-email/render';
import nodemailer from 'nodemailer';
import type SMTPConnection from 'nodemailer/lib/smtp-connection';
import { Queue } from 'quirrel/remix';
import { SmtpConfig } from '~/smtp.server';
import { Email } from '~/templates/request_comment';

/*

Someone commented on a request.

Who should be notified?

- requester (exclude creator if they are not the requester! they don't care)
- watchers

Not:

- person who created if it was created on behalf of someone else
- commenters who are not watching
- person who commented
- mentions (they get an email through the mention script)
*/

export default Queue('/queues/email/request_comment', async (job, meta) => {
  console.log('email sending');
  const { request, user } = job;

  console.log(request);
  // async..await is not allowed in global scope, must use a wrapper
  async function main() {
    const transporter = nodemailer.createTransport(SmtpConfig);

    const emailHtml = render(<Email request={request} />);

    let info = await transporter.sendMail({
      from: request.updator
        ? `"${request.updator.firstName} ${request.updator.lastName}" <${request.updator.email}>`
        : `"${request.creator.firstName} ${request.creator.lastName}" <${request.creator.email}>`,
      to: `${user.email}`, // list of receivers
      subject: 'New Request',
      html: emailHtml,
    });

    console.log('Message sent: %s', info.messageId);
  }

  main().catch(console.error);
});
