import { CronJob } from 'quirrel/remix';
import { updateUserProps } from '~/models/user.server';
import searchRefreshQueue from '~/queues/search_refresh.server';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const SimpleLDAP = require('simple-ldap-search').default;

// scheduled for 1 AM UTC.
export default CronJob('/queues/user_refresh', '0 7 * * *', async () => {
  if (!process.env.LDAP_EMAIL_FIELD) {
    throw 'LDAP_EMAIL_FIELD is missing from configuration.';
  }

  if (!process.env.LDAP_FIRSTNAME) {
    throw 'LDAP_FIRSTNAME is missing from configuration.';
  }

  if (!process.env.LDAP_LASTNAME) {
    throw 'LDAP_LASTNAME is missing from configuration.';
  }

  if (!process.env.LDAP_GROUP_NAME) {
    throw 'LDAP_GROUP_NAME is missing from configuration.';
  }

  const EmailField: string = process.env.LDAP_EMAIL_FIELD || '';
  const FirstnameField: string = process.env.LDAP_FIRSTNAME || '';
  const LastnameField: string = process.env.LDAP_LASTNAME || '';
  const GroupNameField: string = process.env.LDAP_GROUP_NAME || '';

  const config = {
    url: process.env.LDAP_HOST,
    base: process.env.LDAP_BASE_DN,
    dn: process.env.LDAP_USERNAME,
    password: process.env.LDAP_PASSWORD,
    // optionally pass tls options to ldapjs
    // tlsOptions: {
    //   // tls options ...
    // },
  };

  const ldap = new SimpleLDAP(config);

  type AttributeType = {
    cn: string;
    dn: string;
    member: string;
    [key: string]: string;
  };

  const attributes: AttributeType = {
    cn: '',
    dn: '',
    member: '',
  };

  attributes[EmailField] = '';
  attributes[FirstnameField] = '';
  attributes[LastnameField] = '';
  attributes[GroupNameField] = '';

  const users = await ldap.search(
    `(objectClass=${process.env.LDAP_USER_CLASS})`,
    Object.keys(attributes),
  );
  const groups = await ldap.search(
    `(objectClass=${process.env.LDAP_GROUP_CLASS})`,
    Object.keys(attributes),
  );
  ldap.destroy();

  users.forEach(async (user: AttributeType) => {
    await updateUserProps(
      user[EmailField as keyof AttributeType],
      user[FirstnameField as keyof AttributeType],
      user[LastnameField as keyof AttributeType],
      process.env.LDAP_GROUP_NAME
        ? groups
            .filter(
              (group: AttributeType) => group.member.indexOf(user.dn) !== -1,
            )
            .map(
              (group: AttributeType) =>
                group[GroupNameField as keyof typeof attributes],
            )
        : undefined,
    );
  });

  await searchRefreshQueue.enqueue(null);
});
