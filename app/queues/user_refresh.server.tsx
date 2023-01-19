import { CronJob } from "quirrel/remix";
import searchRefreshQueue from "~/queues/search_refresh.server";

const SimpleLDAP = require("simple-ldap-search").default;

import { updateUserProps } from "~/models/user.server";

// scheduled for 1 AM UTC.
export default CronJob("/queues/user_refresh", ["0 7 * * *"], async (job) => {
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
  const attributes = [
    "cn",
    "dn",
    process.env.LDAP_EMAIL_FIELD,
    process.env.LDAP_FIRSTNAME,
    process.env.LDAP_LASTNAME,
    process.env.LDAP_GROUP_NAME,
    "member",
  ];

  const users = await ldap.search(
    `(objectClass=${process.env.LDAP_USER_CLASS})`,
    attributes
  );
  const groups = await ldap.search(
    `(objectClass=${process.env.LDAP_GROUP_CLASS})`,
    attributes
  );
  ldap.destroy();

  users.forEach(async (user) => {
    await updateUserProps(
      user[process.env.LDAP_EMAIL_FIELD],
      user[process.env.LDAP_FIRSTNAME],
      user[process.env.LDAP_LASTNAME],
      groups
        .filter((group) => group.member.indexOf(user.dn) != -1)
        .map((group) => group[process.env.LDAP_GROUP_NAME])
    );
  });

  await searchRefreshQueue.enqueue(null);
});
