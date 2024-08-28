# Northcoders News API

After cloning the repo, to successfully connect to the databases locally you will need to add two `.env` files specifying the databases:

Make a `.env.development` file with contents `PGDATABASE=nc_news` to get access to the running database.

Make a `.env.test` file with contents `PGDATABASE=nc_news_test` to get access to the testing database, which is used when running `npm run test` which tests all the endpoints once setup is finished.

You can then install the dependencies with `npm install`.

To initialise the databases, run `npm run setup-dbs`. Seeding the development database can then be done with `npm run setup-dbs`.

<!-- ---

To host the database, you will need a `.env.production` file, with a DATABASE_URL -->

---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
