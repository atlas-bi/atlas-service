import { Button } from '@react-email/button';
import { Column } from '@react-email/column';
import { Container } from '@react-email/container';
import { Head } from '@react-email/head';
import { Hr } from '@react-email/hr';
import { Html } from '@react-email/html';
import { Link } from '@react-email/link';
import { Preview } from '@react-email/preview';
import { Section } from '@react-email/section';
import { Text } from '@react-email/text';
import * as React from 'react';
import invariant from 'tiny-invariant';

export function Email(props) {
  console.log(props);
  const { request, type } = props;

  invariant(process.env.EXTERNAL_URL, 'EXTERNAL_URL must be set');

  return (
    <Html lang="en">
      <Head>
        <title>new request</title>
      </Head>
      <Preview>Email preview text new request</Preview>;
      <Button href={`asdf`}>Click me</Button>
      <Section>
        <Column>A</Column>
        <Column>B</Column>
        <Column>C</Column>
      </Section>
      <Link
        href={`${process.env.SSL_CERTIFICATE ? 'https://' : 'http://'}${
          process.env.HOSTNAME
        }/request/${request.id}`}
      >
        View Request
      </Link>
      <Text>
        {request.creator.firstName} {request.creator.lastName} transfered a
        request to you.
      </Text>
      <Hr />
      {request.name}
      request id: {request.id}.
    </Html>
  );
}
