import ldap from 'ldapjs-promise';
import { CronJob } from 'quirrel/remix';
import invariant from 'tiny-invariant';
import { updateUserProps } from '~/models/user.server';
import searchRefreshQueue from '~/queues/search_refresh.server';

// scheduled for 1 AM UTC.
export default CronJob('/queues/user_refresh', '0 7 * * *', async () => {
  invariant(process.env.LDAP_USER_SEARCH, 'LDAP_USER_SEARCH not found');
  invariant(process.env.LDAP_GROUP_SEARCH, 'LDAP_GROUP_SEARCH not found');
  invariant(process.env.LDAP_EMAIL_FIELD, 'LDAP_EMAIL_FIELD not found');
  invariant(process.env.LDAP_FIRSTNAME, 'LDAP_FIRSTNAME not found');
  invariant(process.env.LDAP_LASTNAME, 'LDAP_LASTNAME not found');
  invariant(process.env.LDAP_GROUP_NAME, 'LDAP_GROUP_NAME not found');

  const EmailField: string = process.env.LDAP_EMAIL_FIELD || '';
  const FirstnameField: string = process.env.LDAP_FIRSTNAME || '';
  const LastnameField: string = process.env.LDAP_LASTNAME || '';
  const GroupNameField: string = process.env.LDAP_GROUP_NAME || '';
  const ProfilePhotoField: string = process.env.LDAP_PHOTO_FIELD || '';

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
  attributes[ProfilePhotoField] = '';

  const password = process.env.LDAP_PASSWORD;
  const dn = process.env.LDAP_USERNAME;
  const url = process.env.LDAP_HOST;
  const base = process.env.LDAP_BASE_DN;

  const userConfig = {
    // email is required.
    filter: process.env.LDAP_USER_SEARCH,
    paged: {
      pageSize: 500,
    },
    scope: 'sub',
    attributes: Object.keys(attributes),
  };

  const groupConfig = {
    // email is required.
    filter: process.env.LDAP_GROUP_SEARCH,
    paged: {
      pageSize: 500,
    },
    scope: 'sub',
    attributes: Object.keys(attributes),
  };
  function _searchResultToAttributes(pojo) {
    let object = { dn: pojo.objectName };
    pojo.attributes.forEach((attribute) => {
      object[attribute.type] =
        attribute.values.length == 1 ? attribute.values[0] : attribute.values;
    });
    return object;
  }
  const loadUser = async (user: AttributeType, groups) => {
    let profilePhoto = null;

    if (process.env.LDAP_PHOTO_FIELD && user[process.env.LDAP_PHOTO_FIELD]) {
      try {
        //for bytestrings (8 120 99 ...)
        if (
          !isNaN(
            user[process.env.LDAP_PHOTO_FIELD].toString().replace(/\s*/g, ''),
          )
        ) {
          profilePhoto = Buffer.from(
            user[process.env.LDAP_PHOTO_FIELD]
              .split(' ')
              .map((e: string) => parseInt(e)),
          ).toString('base64');
        } else {
          // for true jpeg buffers
          profilePhoto = Buffer.from(
            user.raw[process.env.LDAP_PHOTO_FIELD],
            'binary',
          ).toString('base64');
        }
      } catch (e) {
        console.log(e);
      }
    }

    await updateUserProps(
      user[EmailField as keyof AttributeType],
      user[FirstnameField as keyof AttributeType],
      user[LastnameField as keyof AttributeType],
      process.env.LDAP_GROUP_NAME
        ? groups
            .filter(
              (group: AttributeType) => group.member?.indexOf(user.dn) !== -1,
            )
            .map(
              (group: AttributeType) =>
                group[GroupNameField as keyof typeof attributes],
            )
        : undefined,
      profilePhoto,
    );
  };

  const client = await ldap.createClient({ url });
  await client.bind(dn, password);

  // get groups
  const groups = [];

  const groupResults = await client.searchReturnAll(base, groupConfig);

  for (const group of groupResults.entries) {
    groups.push(_searchResultToAttributes(group.pojo));
  }

  const userPage = await client.searchReturnAll(base, userConfig);

  for (const user of userPage.entries) {
    await loadUser(_searchResultToAttributes(user.pojo), groups);
  }

  await client.destroy();

  await searchRefreshQueue.enqueue(null);
});
