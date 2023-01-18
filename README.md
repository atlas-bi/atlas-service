<h1 align=center>Atlas Service</h1>

**Website Features**

- [ ] User-friendly, atlas style
- [ ] Search for all requests and request history
- [x] SAML2 single sign on
- [ ] LDAP/database user information fetching
- [ ] Potentially a more robust users > director mapping
- [ ] Email integration
- [ ] Sending emails to confirm ticket statuses
- [ ] Sending emails with ticket updates <- maybe only send when entered and when completed?
- [ ] Accepting email replies and appending to request conversation
- [ ] Weekly report queue emails
- [ ] Renovate the ranking query
- [ ] Request due date/estimated duration <- do we have this now and are we sure we want this?
- [ ] Button to share request

**Atlas Integration**

- From atlas

  - [ ] Request changes to a report
  - [ ] Open report queue
  - [ ] See report queue in user profile
  - [ ] Request new report

- From Request
  - [ ] See related reports when creating ticket
  - [ ] See related reports when viewing ticket
  - [ ] Link to report profile, or other way to get to usage faster
  - [ ] On closes requests add some sort of “health” to see what type of requests are most useful

**Requests**

- [ ] Request history tracking
- [ ] Remove unused fields from form, make request process easier
- [ ] Better git integration

**UI**

- [ ] Request Groups
- [ ] Unassigned
- [ ] Assigned
- [ ] Request Categories
- [ ] Open
- [ ] Closed
- [ ] Cancelled
- [ ] In Progress
- [ ] Doc Review
- [ ] Code Review
- [ ] Waiting for information (hold)

**Request form Details**

- Request types

  - [ ] New report
  - [ ] Modify report
  - [ ] Problem
  - [ ] Request Access

- [ ] Category (department)
- [ ] Report name (or deep linked from atlas)
- [ ] Content
- [ ] Purpose
- [ ] Columns
- [ ] Criteria
- [ ] Parameters
- [ ] Registries ???
- [ ] Similar reports
- [ ] Additional info
- [ ] Scheduled report?
- [ ] Who to send to?
- [ ] Frequency
- [ ] Export to excel?
- [ ] Data is regulatory
- [ ] Is this for a major initiative
- [ ] Attach files
- [ ] Description
- [ ] Notes (added by developer)

## Notes

- currently requiring Node 16 for remix-image > ... > node-gyp + better sqlite3

## Development

Build with RemixJs

- Initial setup:

  ```sh
  npm run setup
  ```

- Run the first build:

  ```sh
  npm run build
  ```

- Start dev server:

  ```sh
  npm run dev
  ```

This starts your app in development mode, rebuilding assets on file changes.

The database seed script creates a new user with some data you can use to get started:

- Email: `rachel@remix.run`
- Password: `racheliscool`

### Testing

#### Start a Saml IDP

For development/demoing you can start up a simple SAML IPD server from https://github.com/mcguinness/saml-idp.

1. clone [the repo](https://github.com/mcguinness/saml-idp) somewhere.
2. cd to the repo.
3. generate a cert using their sample code `openssl req -x509 -new -newkey rsa:2048 -nodes -subj '/C=US/ST=California/L=San Francisco/O=JankyCo/CN=Test Identity Provider' -keyout idp-private-key.pem -out idp-public-cert.pem -days 7300 `
4. Start up the IDP server `node ./bin/run.js --acsUrl http://localhost:3000/auth/asc --audience http://localhost:3000/login`

🎉 Nice!

#### Start a LDAP Server

```bash
 docker run -p 389:1389 $(pwd)/test/ldap/config:/ldifs  -e LDAP_CUSTOM_LDIF_DIR=/ldifs --name openldap bitnami/openldap:latest 
```

### Create a .env file

Next, copy the `.env.example` file into `.env`.

Update `SAML_PRIVATE_KEY` and `SAML_ENC_PRIVATE_KEY` to wherever you saved your `.pem` generated in the previous step. Easiest to copy the `.pem` into this folder.. but whatever floats your boat.

Consider changing the database url as well.


### Relevant code:

This is a pretty simple note-taking app, but it's a good example of how you can build a full stack app with Prisma and Remix. The main functionality is creating users, logging in and out, and creating and deleting notes.

- creating users, and logging in and out [./app/models/user.server.ts](./app/models/user.server.ts)
- user sessions, and verifying them [./app/session.server.ts](./app/session.server.ts)
- creating, and deleting notes [./app/models/note.server.ts](./app/models/note.server.ts)

## Deployment

This Remix Stack comes with two GitHub Actions that handle automatically deploying your app to production and staging environments.

## GitHub Actions

We use GitHub Actions for continuous integration and deployment. Anything that gets into the `main` branch will be deployed to production after running tests/build/etc. Anything in the `dev` branch will be deployed to staging.

## Testing

### Cypress

We use Cypress for our End-to-End tests in this project. You'll find those in the `cypress` directory. As you make changes, add to an existing file or create a new file in the `cypress/e2e` directory to test your changes.

We use [`@testing-library/cypress`](https://testing-library.com/cypress) for selecting elements on the page semantically.

To run these tests in development, run `npm run test:e2e:dev` which will start the dev server for the app as well as the Cypress client. Make sure the database is running in docker as described above.

We have a utility for testing authenticated features without having to go through the login flow:

```ts
cy.login();
// you are now logged in as a new user
```

We also have a utility to auto-delete the user at the end of your test. Just make sure to add this in each test file:

```ts
afterEach(() => {
  cy.cleanupUser();
});
```

That way, we can keep your local db clean and keep your tests isolated from one another.

### Vitest

For lower level tests of utilities and individual components, we use `vitest`. We have DOM-specific assertion helpers via [`@testing-library/jest-dom`](https://testing-library.com/jest-dom).

### Type Checking

This project uses TypeScript. It's recommended to get TypeScript set up for your editor to get a really great in-editor experience with type checking and auto-complete. To run type checking across the whole project, run `npm run typecheck`.

### Linting

This project uses ESLint for linting. That is configured in `.eslintrc.js`.

### Formatting

We use [Prettier](https://prettier.io/) for auto-formatting in this project. It's recommended to install an editor plugin (like the [VSCode Prettier plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)) to get auto-formatting on save. There's also a `npm run format` script you can run to format all files in the project.
