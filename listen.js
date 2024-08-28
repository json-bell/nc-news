const app = require("./app");

const { PORT = 8080 } = process.env;

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
