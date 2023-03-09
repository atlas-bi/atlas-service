import type { User } from '@prisma/client';
import { authenticate } from 'ldap-authentication';
import { updateUserProps } from '~/models/user.server';

export type { User } from '@prisma/client';

export async function verifyLogin(email: User['email'], password: string) {
  // first login with ldap

  const options = {
    ldapOpts: {
      url: process.env.LDAP_HOST,
      includeRaw: true,
    },
    adminDn: process.env.LDAP_USERNAME,
    adminPassword: process.env.LDAP_PASSWORD,
    userPassword: password,
    userSearchBase: process.env.LDAP_BASE_DN,
    usernameAttribute: process.env.LDAP_EMAIL_FIELD,
    username: email,
    groupsSearchBase: process.env.LDAP_BASE_DN,
    groupClass: process.env.LDAP_USER_GROUP,
    // groupMemberAttribute: process.env.LDAP_GROUP_NAME,
    starttls: process.env.LDAP_START_TLS === 'true',
  };

  try {
    const ldapUser = await authenticate(options);

    if (!ldapUser) {
      return { user: undefined, error: undefined };
    }

    let profilePhoto = null;

    if (
      process.env.LDAP_PHOTO_FIELD &&
      ldapUser[process.env.LDAP_PHOTO_FIELD]
    ) {
      try {
        //for bytestrings (8 120 99 ...)
        if (
          !isNaN(
            ldapUser[process.env.LDAP_PHOTO_FIELD]
              .toString()
              .replace(/\s*/g, ''),
          )
        ) {
          profilePhoto = Buffer.from(
            ldapUser[process.env.LDAP_PHOTO_FIELD]
              .split(' ')
              .map((e: string) => parseInt(e)),
          ).toString('base64');
        } else {
          // for true jpeg buffers
          profilePhoto = Buffer.from(
            ldapUser.raw[process.env.LDAP_PHOTO_FIELD],
            'binary',
          ).toString('base64');
        }
      } catch (e) {
        console.log(e);
      }
    }

    type Group = {
      cn: string;
      [key: string]: string;
    };

    // update user info
    return {
      user: await updateUserProps(
        email,
        process.env.LDAP_FIRSTNAME
          ? ldapUser[process.env.LDAP_FIRSTNAME]
          : undefined,
        process.env.LDAP_LASTNAME
          ? ldapUser[process.env.LDAP_LASTNAME]
          : undefined,
        ldapUser.groups?.map((group: Group) => group.cn),
        profilePhoto,
      ),
    };
  } catch (err) {
    if (err.admin?.code === 'ENOTFOUND') {
      return { error: 'LDAP Configuration Error: LDAP server unreachable.' };
    }
    if (err.admin) {
      return {
        error: 'LDAP Admin Configuration Error: ' + err.admin.lde_message,
      };
    }
    if (err.lde_message) {
      return { error: 'LDAP Configuration Error: ' + err.lde_message };
    }

    console.log(err);

    return { user: undefined, error: undefined };
  }
}
