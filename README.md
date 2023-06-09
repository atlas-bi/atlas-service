<h1 align=center>Atlas Service</h1>

**Website Features**

- [x] User-friendly, atlas style
- [ ] Search for all requests and request history
- [x] SAML2 single sign on
- [x] LDAP/database user information fetching
- [ ] Potentially a more robust users > director mapping
- [ ] Email integration
- [ ] Sending emails to confirm ticket statuses
- [ ] Sending emails with ticket updates <- maybe only send when entered and when completed?
- [ ] Accepting email replies and appending to request conversation
- [ ] Weekly report queue emails
- [ ] Renovate the ranking query
- [ ] Request due date/estimated duration <- do we have this now and are we sure we want this?
- [ ] Button to share request
- [x] Create tickets for other users
- [ ] Ticket filtering
- [ ] see if someone else is reading the same ticket
- [ ] see if someone else is already replying to a ticket
- [x] option for other users to "watch" a ticket
- [ ] option for adding attachments
- [ ] option to take a screen shot directly
- [x] allow multiple people to be assigned to a single ticket
- [x] ticket labeling with scoped labels
- [ ] allow tickets to be grouped into projects
- [ ] allow tickets inside a project to be split

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
- [x] Remove unused fields from form, make request process easier
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
- [x] Content
- [x] Purpose
- [ ] Columns
- [x] Criteria
- [x] Parameters
- [ ] Registries ???
- [ ] Similar reports
- [ ] Additional info
- [x] Scheduled report?
- [x] Who to send to?
- [x] Frequency
- [x] Export to excel?
- [x] Data is regulatory
- [x] Is this for a major initiative
- [x] Attach files
- [x] Description
- [ ] Notes (added by developer)

## Development

### Create a .env file

Next, copy the `.env.example` file into `.env`.

Update `SAML_PRIVATE_KEY` and `SAML_ENC_PRIVATE_KEY` to wherever you saved your `.pem` generated in the previous step. Easiest to copy the `.pem` into this folder.. but whatever floats your boat.

Consider changing the database url as well.

### Build with RemixJs

[Install `meilisearch`](https://docs.meilisearch.com/learn/getting_started/quick_start.html#setup-and-installation)

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

This starts your app in development mode, starts a few tools needed for development, several of which use docker:

- SAML IDP server (accessible @ http://localhost:7000)
- LDAP server
- Quirrel job scheduler (accessible @ http://localhost:9181)
- Meilisearch (accessible @ http://localhost:7700)
- static file watchers
- SMTP4Dev SMPT/IMAP email server (accessible @ http://localhost:3030)
- website (accessible @ http://localhost:3000)

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

## Alternate Tools

- jitbit.com
