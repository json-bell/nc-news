# Northcoders News API

## Hosted version

You can access the API <a href="https://nc-news-e223.onrender.com/api/" target="_blank">here</a>
, hosted with Supabase and Render. The `/api` endpoint responds with a list of available endpoints.  
 _(It may take a minute to load, as Render will spin the instance down after inactivity.)_

## The project

This is the back-end architecture for a news app, composed of articles, comments, users and topics.

The database is PostgreSQL, queried using node-postgres from requests made with Express.js.

## Connecting to the database locally

With this repo you can connect locally to the database and run the tests:

### _Common set-up_

First, clone the repository locally:

```bash
git clone https://github.com/json-bell/nc-news
cd ./nc-news
```

Then initialise the databases with node

```bash
npm run setup-dbs
```

### _Running tests_

To install all dependencies (including test dependencies), run

```bash
npm install
```

Configure the environment variables by creating a `.env.test` file with contents `PGDATABASE=nc_news_test` providing the database to the connection

```bash
echo "PGDATABASE=nc_news_test" > .env.test
```

The Jest and Supertest test suites can then be ran with node

```bash
npm run test
```

or for more detailed descriptions, run the suites individually:

- for the API tests, run

```bash
npm run test __tests__/app.test.js
```

- for the util tests, run

```bash
npm run test __tests__/utils.test.js
```

### _Development Database_

If you haven't yet installed dependencies from testing, install the production dependencies with

```bash
npm install --production
```

To access the development database, create a `.env.development` with contents `PGDATABASE=nc_news`:

```bash
echo "PGDATABASE=nc_news" > .env.development
```

You can then seed the development database with data with

```bash
npm run seed
```

There is a script that runs the server for convenience, which can be called with

```bash
npm run start
```

where the port (defaults to 8080) can be chosen by replacing this in

```bash
PORT=8080 npm run start
```

---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
