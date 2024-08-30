const request = require("supertest");

const app = require("../app");
const db = require("../db/connection");

const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("/api", () => {
  describe("GET", () => {
    test("GET 200: returns all available endpoints", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then(({ body }) => {
          const endpoints = require("../endpoints.json");
          expect(body).toEqual(endpoints);
        });
    });
  });
});

describe("/api/topics", () => {
  describe("GET", () => {
    test("GET 200: returns an array of all topics", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body: { topics } }) => {
          expect(topics.length).toBe(3);
          topics.forEach((topic) =>
            expect(topic).toMatchObject({
              slug: expect.any(String),
              description: expect.any(String),
            })
          );
        });
    });
  });
  describe("POST", () => {
    test("POST 201: responds with new topic", () => {
      return request(app)
        .post("/api/topics")
        .send({ slug: "turtles", description: "turtles are pretty awesome" })
        .expect(201)
        .then(({ body: { topic } }) =>
          expect(topic).toMatchObject({
            slug: "turtles",
            description: "turtles are pretty awesome",
          })
        );
    });
    test("POST 201: adds new topic to database", () => {
      return request(app)
        .post("/api/topics")
        .send({ slug: "turtles", description: "turtles are pretty awesome" })
        .expect(201)
        .then(() => request(app).get("/api/topics").expect(200))
        .then(({ body: { topics } }) =>
          expect(topics.find((topic) => topic.slug === "turtles")) /* */
            .toMatchObject({
              slug: "turtles",
              description: "turtles are pretty awesome",
            })
        );
    });
    test("POST 400: if topic already exists, doesn't modify previous topic", () => {
      return request(app)
        .post("/api/topics")
        .send({
          slug: "mitch",
          description:
            "I just want to include mitch again because he's so great",
        })
        .expect(400)
        .then(() => request(app).get("/api/topics").expect(200))
        .then(({ body: { topics } }) =>
          expect(topics.find((topic) => topic.slug === "mitch")).toMatchObject({
            slug: "mitch",
            description: "The man, the Mitch, the legend",
          })
        );
    });
    test("POST 400: if payload doesn't contain topic", () => {
      return request(app)
        .post("/api/topics")
        .send({ not_topic: "bugs", description: "ahh maybe there are no bugs" })
        .expect(400)
        .then(({ body: { msg } }) => expect(msg).toBe("Bad request"));
    });
    test("POST 200: if payload doesn't contain topic, description defaults to topic", () => {
      return request(app)
        .post("/api/topics")
        .send({ slug: "bugs" })
        .expect(201)
        .then(({ body: { topic } }) =>
          expect(topic).toMatchObject({ slug: "bugs", description: "bugs" })
        );
    });
  });
});

describe("/api/users", () => {
  describe("GET", () => {
    test("GET 200: responds with an array of all users", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body: { users } }) => {
          expect(users.length).toBe(4);
          users.forEach((user) => {
            expect(user).toMatchObject({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            });
          });
        });
    });
  });
});

describe("/api/users/:username", () => {
  describe("GET", () => {
    test("GET 200: responds with a user object", () => {
      return request(app)
        .get("/api/users/rogersop")
        .expect(200)
        .then(({ body: { user } }) =>
          expect(user).toMatchObject({
            username: "rogersop",
            name: "paul",
            avatar_url:
              "https://avatars2.githubusercontent.com/u/24394918?s=400&v=4",
          })
        );
    });
    test("GET 404: responds with a 404 if the slug is not present in the database", () =>
      request(app)
        .get("/api/users/banana")
        .expect(404)
        .then(({ body }) =>
          expect(body).toMatchObject({
            msg: "Resource not found",
            details: expect.stringMatching(/was not found in/),
          })
        ));
  });
});

describe("/api/articles", () => {
  describe("GET (default limit 10)", () => {
    test("GET 200: finds first 10 articles", () =>
      request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(10);
          articles.forEach((article) => {
            expect(article).toMatchObject({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number),
            });
          });
        }));
    test("GET 200: counts comments on articles", () =>
      request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) =>
          expect(
            articles.find((article) => article.article_id === 1)
          ).toMatchObject({ comment_count: 11 })
        ));
    test("GET 200: articles do not have a body property", () =>
      request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(10);
          articles.forEach((article) => {
            expect(article.hasOwnProperty("body")).toBe(false);
          });
        }));
    test("GET 200: articles sort by date in descending order by default", () =>
      request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) =>
          expect(articles).toBeSortedBy("created_at", { descending: true })
        ));
  });
  describe("GET sorting", () => {
    test("GET 200: takes a sort_by query that sorts by any valid column", () =>
      request(app)
        .get("/api/articles?sort_by=title")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(10);
          expect(articles).toBeSortedBy("title", { descending: true });
        }));
    test("GET 200: takes a order query, desc sorts by descending", () =>
      request(app)
        .get("/api/articles?order=desc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(10);
          expect(articles).toBeSortedBy("created_at", { descending: true });
        }));
    test("GET 200: order query is case insensitive, asc sorts by ascending", () =>
      request(app)
        .get("/api/articles?order=aSC")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(10);
          expect(articles).toBeSortedBy("created_at");
        }));
    test("GET 200: takes a order query, asc sorts by ascending", () =>
      request(app)
        .get("/api/articles?order=asc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(10);
          expect(articles).toBeSortedBy("created_at");
        }));
    test("GET 200: can take both an order and a sort_by query", () =>
      request(app)
        .get("/api/articles?sort_by=article_id&order=asc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(10);
          expect(articles).toBeSortedBy("article_id");
        }));
    test("GET 400: if order is not valid", () =>
      request(app)
        .get("/api/articles?order=not-an-order")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        }));
    test("GET 400: invalid column name to sort by", () =>
      request(app)
        .get("/api/articles?sort_by=not-a-column")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        }));
  });
  describe("GET topic filter", () => {
    test("GET 200: filters topic if given a query", () =>
      request(app)
        .get("/api/articles?topic=cats")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(1);
          articles.forEach((article) => {
            expect(article.topic).toBe("cats");
          });
        }));
    test("GET 200: returns an empty array for a valid topic with no associated articles", () =>
      request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toEqual([]);
        }));
    test("GET 404: if given topic that isn't in database responds with a 404", () =>
      request(app)
        .get("/api/articles?topic=bananas")
        .expect(404)
        .then(({ body }) =>
          expect(body).toMatchObject({
            msg: "Resource not found",
            details: expect.stringMatching(/was not found in/),
          })
        ));
    test("GET 200: response includes a total_count that counts number of articles", () =>
      request(app)
        .get("/api/articles?limit=3&p=2")
        .expect(200)
        .then(({ body: { total_count } }) => {
          expect(total_count).toBe(13);
        }));
    test("GET 200: total_count considers filters", () =>
      request(app)
        .get("/api/articles?limit=5&p=1&topic=mitch")
        .expect(200)
        .then(({ body: { total_count } }) => {
          expect(total_count).toBe(12);
        }));
  });
  describe("GET limit", () => {
    test("GET 200: limit query limits number of articles", () =>
      request(app)
        .get("/api/articles?limit=5")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(5);
          articles.forEach((article) => {
            expect(article).toMatchObject({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number),
            });
          });
        }));
    test("GET 200: limit shows all articles if limit is bigger than number of articles", () =>
      request(app)
        .get("/api/articles?limit=20")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(13);
        }));
    test("GET 200: giving limit='infinity' or 'none' gives all articles", () =>
      request(app)
        .get("/api/articles?limit=infinity")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(13);
        }));
    test("GET 200: giving limit=0 gives all articles", () =>
      request(app)
        .get("/api/articles?limit=0")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(13);
        }));
    test("GET 400: errors if limit is negative", () =>
      request(app)
        .get("/api/articles?limit=-20")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        }));
    test("GET 400: errors if limit is not a number or keyword", () =>
      request(app)
        .get("/api/articles?limit=bananas")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        }));
    test("GET 200: limit is compatible with sort and defaults to page 1", () =>
      request(app)
        .get("/api/articles?limit=5&sort_by=article_id&order=asc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(5);
          expect(articles).toBeSortedBy("article_id");
          articles.forEach((article) =>
            expect([1, 2, 3, 4, 5].includes(article.article_id)).toEqual(true)
          );
        }));
  });
  describe("GET pagination", () => {
    test("GET 200: page specifies higher pages", () =>
      request(app)
        .get("/api/articles?limit=5&sort_by=article_id&p=2&order=asc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(5);
          expect(articles).toBeSortedBy("article_id");
          articles.forEach((article) =>
            expect([6, 7, 8, 9, 10].includes(article.article_id)).toEqual(true)
          );
        }));
    test("GET 200: page gives partial pages on last page", () =>
      request(app)
        .get("/api/articles?sort_by=article_id&p=2&order=asc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(3);
          expect(articles).toBeSortedBy("article_id");
          articles.forEach((article) =>
            expect([11, 12, 13].includes(article.article_id)).toEqual(true)
          );
        }));
    test("GET 200: page returns empty array if given a negative integer", () =>
      request(app)
        .get("/api/articles?limit=9&p=-2")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toEqual([]);
        }));
    test("GET 200: page returns empty array if given a integer out of range", () =>
      request(app)
        .get("/api/articles?limit=6&p=15")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toEqual([]);
        }));
    test("GET 400: errors if page query is a not whole number", () =>
      request(app)
        .get("/api/articles?p=15.2")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        }));
    test("GET 400: errors if page query is not a number", () =>
      request(app)
        .get("/api/articles?p=15.2")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        }));
  });
  describe("POST", () => {
    test("POST 201: responds with the newly added article, generating other properies", () => {
      const payload = {
        author: "lurker",
        title: "Cats time",
        body: "I've decided I'm going to start owning cats! This is a new chapter for me",
        topic: "cats",
        article_img_url:
          "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?w=700&h=700",
      };
      return request(app)
        .post("/api/articles")
        .send(payload)
        .expect(201)
        .then(({ body: { article } }) =>
          expect(article).toMatchObject({
            author: "lurker",
            title: "Cats time",
            body: "I've decided I'm going to start owning cats! This is a new chapter for me",
            topic: "cats",
            article_img_url:
              "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?w=700&h=700",
            article_id: expect.any(Number),
            votes: 0,
            created_at: expect.any(String),
            comment_count: 0,
          })
        );
    });
    test("POST 201: adds the newly added article to database", () => {
      const payload = {
        author: "lurker",
        title: "Cats time",
        body: "I've decided I'm going to start owning cats! This is a new chapter for me",
        topic: "cats",
        article_img_url:
          "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?w=700&h=700",
      };
      return request(app)
        .post("/api/articles")
        .send(payload)
        .expect(201)
        .then(({ body: { article: respArt } }) =>
          request(app).get(`/api/articles/${respArt.article_id}`).expect(200)
        )
        .then(({ body: { article } }) =>
          expect(article).toMatchObject({
            author: "lurker",
            title: "Cats time",
            body: "I've decided I'm going to start owning cats! This is a new chapter for me",
            topic: "cats",
            article_img_url:
              "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?w=700&h=700",
            article_id: expect.any(Number),
            votes: 0,
            created_at: expect.any(String),
            comment_count: 0,
          })
        );
    });
    test("POST 201: sets default image if one isn't provided", () => {
      const payload = {
        author: "lurker",
        title: "Cats time",
        body: "I've decided I'm going to start owning cats! This is a new chapter for me",
        topic: "cats",
      };
      return request(app)
        .post("/api/articles")
        .send(payload)
        .expect(201)
        .then(({ body: { article } }) =>
          expect(article).toMatchObject({
            author: "lurker",
            title: "Cats time",
            body: "I've decided I'm going to start owning cats! This is a new chapter for me",
            topic: "cats",
            article_img_url:
              "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
            article_id: expect.any(Number),
            votes: 0,
            created_at: expect.any(String),
            comment_count: 0,
          })
        );
    });
    test("POST 404: errors if the given author isn't a user in the database", () => {
      const payload = {
        author: "not-a-user",
        title: "Cats time",
        body: "I've decided I'm going to start owning cats! This is a new chapter for me",
        topic: "cats",
        article_img_url:
          "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?w=700&h=700",
      };
      return request(app)
        .post("/api/articles")
        .send(payload)
        .expect(404)
        .then(({ body: { msg } }) => expect(msg).toBe("Resource not found"));
    });
    test("POST 404: errors if the given topic isn't in the database", () => {
      const payload = {
        author: "lurker",
        title: "Cats time",
        body: "I've decided I'm going to start owning cats! This is a new chapter for me",
        topic: "bananas",
        article_img_url:
          "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?w=700&h=700",
      };
      return request(app)
        .post("/api/articles")
        .send(payload)
        .expect(404)
        .then(({ body: { msg } }) => expect(msg).toBe("Resource not found"));
    });
    test("POST 400: errors if payload is missing a required property", () => {
      const payload = {
        author: "lurker",
        body: "I've decided I'm going to start owning cats! This is a new chapter for me",
        topic: "cats",
        article_img_url:
          "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?w=700&h=700",
      };
      return request(app)
        .post("/api/articles")
        .send(payload)
        .expect(400)
        .then(({ body: { msg } }) => expect(msg).toBe("Bad request"));
    });
  });
});

describe("/api/articles/:article_id", () => {
  describe("GET", () => {
    test("GET 200: finds article by its id", () =>
      request(app)
        .get("/api/articles/3")
        .expect(200)
        .then(({ body: { article } }) =>
          expect(article).toMatchObject({
            article_id: 3,
            title: "Eight pug gifs that remind me of mitch",
            topic: "mitch",
            author: "icellusedkars",
            body: "some gifs",
            created_at: "2020-11-03T09:12:00.000Z",
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            votes: expect.any(Number),
          })
        ));
    test("GET 404: returns Not Found message if id is valid but not present", () =>
      request(app)
        .get("/api/articles/8080")
        .expect(404)
        .then(({ body }) =>
          expect(body).toMatchObject({
            msg: "Resource not found",
            details: expect.stringMatching(/was not found in/),
          })
        ));
    test("GET 400: returns Bad Request message if id is invalid", () =>
      request(app)
        .get("/api/articles/dog")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        }));
    test("GET 200: includes comment count", () =>
      request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article.comment_count).toBe(11);
        }));
    test("GET 200: includes 0 when no comments are present", () =>
      request(app)
        .get("/api/articles/2")
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article.comment_count).toBe(0);
        }));
  });
  describe("PATCH votes", () => {
    test("PATCH 200: responds with article with updated vote count", () =>
      request(app)
        .patch("/api/articles/13")
        .send({ inc_votes: 6 })
        .expect(200)
        .then(({ body: { article } }) =>
          expect(article).toMatchObject({
            article_id: 13,
            title: "Another article about Mitch",
            topic: "mitch",
            author: "butter_bridge",
            body: "There will never be enough articles about Mitch!",
            created_at: "2020-10-11T11:24:00.000Z",
            votes: 6,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          })
        ));
    test("PATCH 200: correctly increases vote count", () =>
      request(app)
        .patch("/api/articles/1")
        .send({ inc_votes: 6 })
        .expect(200)
        .then(() => request(app).get("/api/articles/1").expect(200))
        .then(({ body: { article } }) =>
          expect(article).toMatchObject({
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 106,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          })
        ));
    test("PATCH 200: correctly decreases vote count", () =>
      request(app)
        .patch("/api/articles/1")
        .send({ inc_votes: -25 })
        .expect(200)
        .then(() => request(app).get("/api/articles/1").expect(200))
        .then(({ body: { article } }) =>
          expect(article).toMatchObject({
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 75,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          })
        ));
    test("PATCH 200: responds with the unmodified article if no correct patch keys in payload", () =>
      request(app)
        .patch("/api/articles/13")
        .send({ not_good_key: 6 })
        .expect(200)
        .then(({ body: { article } }) =>
          expect(article).toMatchObject({
            article_id: 13,
            title: "Another article about Mitch",
            topic: "mitch",
            author: "butter_bridge",
            body: "There will never be enough articles about Mitch!",
            created_at: "2020-10-11T11:24:00.000Z",
            votes: 0,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          })
        ));
    test("PATCH 404: responds not found if id is valid but not present", () =>
      request(app)
        .patch("/api/articles/8000")
        .send({ inc_votes: 6 })
        .expect(404)
        .then(({ body }) =>
          expect(body).toMatchObject({
            msg: "Resource not found",
            details: expect.stringMatching(/was not found in/),
          })
        ));
    test("PATCH 400: responds bad request if id is invalid", () =>
      request(app)
        .patch("/api/articles/banana")
        .send({ inc_votes: 6 })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        }));
    test("PATCH 400: responds bad request if inc_votes isn't an integer", () =>
      request(app)
        .patch("/api/articles/3")
        .send({ inc_votes: "seven yay" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        }));
  });
  describe("PATCH content", () => {
    test("PATCH 200: body: correctly responds with the updated article", () =>
      request(app)
        .patch("/api/articles/13")
        .send({
          body: "This is a better body, Mitch is still great though!",
        })
        .expect(200)
        .then(({ body: { article } }) => {
          const expectedResponse = {
            article_id: 13,
            title: "Another article about Mitch",
            topic: "mitch",
            author: "butter_bridge",
            body: "This is a better body, Mitch is still great though!",
            created_at: "2020-10-11T11:24:00.000Z",
            votes: 0,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          };
          expect(article).toMatchObject(expectedResponse);
        }));
    test("PATCH 200: body: correctly updates article in database", () =>
      request(app)
        .patch("/api/articles/13")
        .send({
          body: "This is a better body, Mitch is still great though!",
        })
        .expect(200)
        .then(() => request(app).get("/api/articles/13").expect(200))
        .then(({ body: { article } }) => {
          const expectedResponse = {
            article_id: 13,
            title: "Another article about Mitch",
            topic: "mitch",
            author: "butter_bridge",
            body: "This is a better body, Mitch is still great though!",
            created_at: "2020-10-11T11:24:00.000Z",
            votes: 0,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          };
          expect(article).toMatchObject(expectedResponse);
        }));
    test("PATCH 200: dynamically responds according to body, title or topic", () =>
      request(app)
        .patch("/api/articles/13")
        .send({
          title: "Best article about Mitch",
        })
        .expect(200)
        .then(({ body: { article: article } }) => {
          const expectedResponse = {
            article_id: 13,
            title: "Best article about Mitch",
            topic: "mitch",
            author: "butter_bridge",
            body: "There will never be enough articles about Mitch!",
            created_at: "2020-10-11T11:24:00.000Z",
            votes: 0,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          };
          expect(article).toMatchObject(expectedResponse);
        }));
    test("PATCH 200: dynamically updates according to body, title or topic", () =>
      request(app)
        .patch("/api/articles/13")
        .send({
          topic: "cats",
        })
        .expect(200)
        .then(() => request(app).get("/api/articles/13").expect(200))
        .then(({ body: { article } }) => {
          const expectedResponse = {
            article_id: 13,
            title: "Another article about Mitch",
            topic: "cats",
            author: "butter_bridge",
            body: "There will never be enough articles about Mitch!",
            created_at: "2020-10-11T11:24:00.000Z",
            votes: 0,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          };
          expect(article).toMatchObject(expectedResponse);
        }));
    test("PATCH 404: if given a topic that doesn't exist, responds with a 400", () =>
      request(app)
        .patch("/api/articles/4")
        .send({ topic: "not-a-topic" })
        .expect(404)
        .then(({ body }) => {
          expect(body).toMatchObject({
            msg: "Resource not found",
            details: expect.stringMatching(/was not found in/),
          });
        }));
    test("PATCH 200: patch can take multiple of the keys of body, title, topic and inc_value", () =>
      request(app)
        .patch("/api/articles/13")
        .send({
          title: "Best article about Mitch",
          body: "Here's the new body",
          inc_votes: 7,
        })
        .expect(200)
        .then(({ body: { article: article } }) => {
          const expectedResponse = {
            title: "Best article about Mitch",
            article_id: 13,
            topic: "mitch",
            author: "butter_bridge",
            body: "Here's the new body",
            created_at: "2020-10-11T11:24:00.000Z",
            votes: 7,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          };
          expect(article).toMatchObject(expectedResponse);
        }));
  });
  describe("DELETE", () => {
    test("DELETE 204: deletes an article by its id", () => {
      return request(app).delete("/api/articles/3").expect(204);
    });
    test("DELETE 404: valid id doesn't have an associated article to delete", () =>
      request(app)
        .delete("/api/articles/8080")
        .expect(404)
        .then(({ body }) => {
          expect(body).toMatchObject({
            msg: "Resource not found",
            details: expect.stringMatching(/was not found in/),
          });
        }));
    test("DELETE 400: invalid article_id", () =>
      request(app)
        .delete("/api/articles/dog")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        }));
  });
});

describe("/api/articles/:article_id/comments", () => {
  describe("GET", () => {
    test("GET 200: responds with an empty array if the article has no comments", () =>
      request(app)
        .get("/api/articles/8/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toEqual([]);
        }));
    test("GET 200: finds an article's comments by its id if it has comments", () =>
      request(app)
        .get("/api/articles/3/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments.length).toBe(2);
          comments.forEach((comment) => {
            expect(comment).toMatchObject({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: 3,
            });
          });
        }));
    test("GET 200: comments are sorted with most recent comments first", () =>
      request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body: { comments } }) =>
          expect(comments).toBeSortedBy("created_at", { descending: true })
        ));
    test("GET 404: returns Not Found message if article id is valid but not present", () =>
      request(app)
        .get("/api/articles/8080/comments")
        .expect(404)
        .then(({ body }) => {
          expect(body).toMatchObject({
            msg: "Resource not found",
            details: expect.stringMatching(/was not found in/),
          });
        }));
    test("GET 400: returns Bad Request message if article id is invalid", () =>
      request(app)
        .get("/api/articles/dog/comments")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        }));
  });
  describe("GET sorting", () => {
    test("GET 200: takes a sort_by query that sorts by any valid column", () =>
      request(app)
        .get("/api/articles/1/comments?sort_by=votes")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments.length).toBe(10);
          expect(comments).toBeSortedBy("votes", { descending: true });
        }));
    test("GET 200: takes a order query, desc sorts by descending", () =>
      request(app)
        .get("/api/articles/1/comments?order=desc")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments.length).toBe(10);
          expect(comments).toBeSortedBy("created_at", { descending: true });
        }));
    test("GET 200: takes a order query, asc sorts by ascending", () =>
      request(app)
        .get("/api/articles/1/comments?order=asc")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments.length).toBe(10);
          expect(comments).toBeSortedBy("created_at");
        }));
    test("GET 200: order query is case insensitive", () =>
      request(app)
        .get("/api/articles/1/comments?order=aSC")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments.length).toBe(10);
          expect(comments).toBeSortedBy("created_at");
        }));
    test("GET 200: can take both an order and a sort_by query", () =>
      request(app)
        .get("/api/articles/1/comments?sort_by=comment_id&order=asc")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments.length).toBe(10);
          expect(comments).toBeSortedBy("comment_id");
        }));
    test("GET 400: if order is not valid", () =>
      request(app)
        .get("/api/articles/1/comments?order=not-an-order")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        }));
    test("GET 400: invalid column name to sort by", () =>
      request(app)
        .get("/api/articles/1/comments?sort_by=not-a-column")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        }));
  });
  describe("GET limit", () => {
    /* comment_ids for article 1: 2,3,4,5,6,7,8,9,12,13,18*/
    test("GET 200: limit defaults to 10", () =>
      request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments.length).toBe(10);
          comments.forEach((comment) => {
            expect(comment).toMatchObject({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: 1,
            });
          });
        }));
    test("GET 200: limit query limits number of comments & keeps sorting", () =>
      request(app)
        .get("/api/articles/1/comments?limit=5")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments.length).toBe(5);
          expect(comments).toBeSortedBy("created_at", { descending: true });
          comments.forEach((comment) => {
            expect(comment).toMatchObject({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: 1,
            });
          });
        }));
    test("GET 200: limit shows all comments if limit is bigger than total", () =>
      request(app)
        .get("/api/articles/1/comments?limit=20")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments.length).toBe(11);
        }));
    test("GET 200: giving limit='infinity' or 'none' gives all comments", () =>
      request(app)
        .get("/api/articles/1/comments?limit=infinity")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments.length).toBe(11);
        }));
    test("GET 200: giving limit=0 gives all comments", () =>
      request(app)
        .get("/api/articles/1/comments?limit=0")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments.length).toBe(11);
        }));
    test("GET 400: errors if limit is negative", () =>
      request(app)
        .get("/api/articles/1/comments?limit=-20")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        }));
    test("GET 400: errors if limit is not a number or keyword", () =>
      request(app)
        .get("/api/articles/1/comments?limit=bananas")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        }));
  });
  describe("GET pagination", () => {
    test("GET 200: page specifies higher pages", () =>
      request(app)
        .get(
          "/api/articles/1/comments?limit=5&sort_by=comment_id&p=2&order=asc"
        )
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments.length).toBe(5);
          expect(comments).toBeSortedBy("comment_id");
          comments.forEach((comment) =>
            expect([7, 8, 9, 12, 13].includes(comment.comment_id)).toEqual(true)
          );
        }));
    test("GET 200: page gives partial pages on last page", () =>
      request(app)
        .get("/api/articles/1/comments?sort_by=comment_id&p=2&limit=8")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments.length).toBe(3);
          expect(comments).toBeSortedBy("comment_id", { descending: true });
          comments.forEach((comment) =>
            expect([2, 3, 4].includes(comment.comment_id)).toEqual(true)
          );
        }));
    test("GET 200: page returns empty array if given a negative integer", () =>
      request(app)
        .get("/api/articles/1/comments?limit=9&p=-2")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toEqual([]);
        }));
    test("GET 200: page returns empty array if given a integer out of range", () =>
      request(app)
        .get("/api/articles/1/comments?limit=6&p=15")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toEqual([]);
        }));
    test("GET 400: errors if page query is a not whole number", () =>
      request(app)
        .get("/api/articles/1/comments?p=15.2")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        }));
    test("GET 400: errors if page query is not a number", () =>
      request(app)
        .get("/api/articles/1/comments?p=15.2")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        }));
  });
  describe("POST", () => {
    test("POST 201: responds with the newly added comment", () => {
      const payload = {
        username: "rogersop",
        body: "This is amazing",
      };
      return request(app)
        .post("/api/articles/9/comments")
        .send(payload)
        .expect(201)
        .then(({ body: { comment } }) =>
          expect(comment).toMatchObject({
            author: "rogersop",
            body: "This is amazing",
            comment_id: expect.any(Number),
            article_id: 9,
            votes: 0,
            created_at: expect.any(String),
          })
        );
    });
    test("POST 201: adds the newly added comment to the comment list", () => {
      const payload = {
        username: "rogersop",
        body: "This is amazing",
      };
      return request(app)
        .post("/api/articles/9/comments")
        .send(payload)
        .expect(201)
        .then(({ body: { comment: newComment } }) =>
          Promise.all([
            request(app).get("/api/articles/9/comments").expect(200),
            newComment.comment_id,
          ])
        )
        .then(
          // prettier-ignore
          ([ { body: { comments } }, comment_id]) =>
            expect(
              comments.find((comment) => comment.comment_id === comment_id)
            ).toMatchObject({
              author: "rogersop",
              body: "This is amazing",
              comment_id: expect.any(Number),
              article_id: 9,
              votes: 0,
              created_at: expect.any(String),
            })
        );
    });
    test("POST 404: if article id not found returns error", () => {
      const payload = {
        username: "rogersop",
        body: "This is amazing",
      };
      return request(app)
        .post("/api/articles/8080/comments")
        .send(payload)
        .expect(404)
        .then(({ body: { msg } }) => expect(msg).toBe("Resource not found"));
    });
    test("POST 404: if user not found, errors and doesn't insert a comment", () => {
      const payload = {
        username: "this-is-not-a-user_:(",
        body: "This is not very amazing",
      };
      return request(app)
        .post("/api/articles/13/comments")
        .send(payload)
        .expect(404)
        .then(({ body: { msg } }) => expect(msg).toBe("Resource not found"))
        .then(() =>
          request(app)
            .get("/api/articles/13/comments")
            .expect(200)
            .then(({ body: { comments } }) => expect(comments.length).toBe(0))
        );
    });
    test("POST 400: errors if article id invalid", () => {
      const payload = {
        username: "rogersop",
        body: "This is amazing",
      };
      return request(app)
        .post("/api/articles/banana/comments")
        .send(payload)
        .expect(400)
        .then(({ body: { msg } }) => expect(msg).toBe("Bad request"));
    });
    test("POST 400: errors if provided body doesn't contain a username or body key and doesn't insert a comment", () => {
      const payload = {
        username: "rogersop",
        incorrect_key: "This is definitely a comment",
      };
      return request(app)
        .post("/api/articles/13/comments")
        .send(payload)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
          return request(app).get("/api/articles/13/comments").expect(200);
        })
        .then(({ body: { comments } }) => expect(comments.length).toBe(0));
    });
  });
});

describe("/api/comments/:comment_id", () => {
  describe("GET", () => {
    test("GET 200: finds comment by its id", () =>
      request(app)
        .get("/api/comments/3")
        .expect(200)
        .then(({ body: { comment } }) =>
          expect(comment).toMatchObject({
            comment_id: 3,
            body: "Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.",
            article_id: 1,
            author: "icellusedkars",
            votes: 100,
            created_at: "2020-03-01T01:13:00.000Z",
          })
        ));
    test("GET 404: returns Not Found message if id is valid but not present", () =>
      request(app)
        .get("/api/comments/8080")
        .expect(404)
        .then(({ body }) => {
          expect(body).toMatchObject({
            msg: "Resource not found",
            details: expect.stringMatching(/was not found in/),
          });
        }));
    test("GET 400: returns Bad Request message if id is invalid", () =>
      request(app)
        .get("/api/comments/dog")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        }));
  });
  describe("PATCH votes", () => {
    test("PATCH 200: responds with comment with updated vote count", () =>
      request(app)
        .patch("/api/comments/2")
        .send({ inc_votes: 6 })
        .expect(200)
        .then(({ body: { comment } }) =>
          expect(comment).toMatchObject({
            comment_id: 2,
            body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
            article_id: 1,
            author: "butter_bridge",
            votes: 20,
            created_at: "2020-10-31T03:03:00.000Z",
          })
        ));
    test("PATCH 200: correctly increases vote count", () =>
      request(app)
        .patch("/api/comments/2")
        .send({ inc_votes: 6 })
        .expect(200)
        .then(() => request(app).get("/api/articles/1/comments").expect(200))
        .then(({ body: { comments } }) =>
          expect(
            comments.find((comment) => comment.comment_id === 2)
          ).toMatchObject({
            comment_id: 2,
            body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
            article_id: 1,
            author: "butter_bridge",
            votes: 20,
            created_at: "2020-10-31T03:03:00.000Z",
          })
        ));
    test("PATCH 200: correctly decreases vote count", () =>
      request(app)
        .patch("/api/comments/2")
        .send({ inc_votes: -2 })
        .expect(200)
        .then(() =>
          request(app)
            .get("/api/articles/1/comments")
            .expect(200)
            .then(({ body: { comments } }) => {
              expect(
                comments.find((comment) => comment.comment_id === 2)
              ).toMatchObject({
                comment_id: 2,
                body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
                article_id: 1,
                author: "butter_bridge",
                votes: 12,
                created_at: "2020-10-31T03:03:00.000Z",
              });
            })
        ));
    test("PATCH 200: responds with the unmodified article if no correct patch keys in payload", () => {
      return request(app)
        .patch("/api/comments/2")
        .send({ not_good_key: 6 })
        .expect(200)
        .then(({ body: { comment } }) => {
          expect(comment).toMatchObject({
            comment_id: 2,
            body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
            article_id: 1,
            author: "butter_bridge",
            votes: 14,
            created_at: "2020-10-31T03:03:00.000Z",
          });
        });
    });
    test("PATCH 404: responds not found if id is valid but not present", () => {
      return request(app)
        .patch("/api/comments/8000")
        .send({ inc_votes: 6 })
        .expect(404)
        .then(({ body }) => {
          expect(body).toMatchObject({
            msg: "Resource not found",
            details: expect.stringMatching(/was not found in/),
          });
        });
    });
    test("PATCH 400: responds bad request if id is invalid", () => {
      return request(app)
        .patch("/api/comments/banana")
        .send({ inc_votes: 6 })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("PATCH 400: responds bad request if inc_votes isn't an integer", () => {
      return request(app)
        .patch("/api/comments/3")
        .send({ inc_votes: "seven yay" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });
  describe("PATCH body", () => {
    test("PATCH 200: body: correctly responds with the updated comment", () => {
      return request(app)
        .patch("/api/comments/2")
        .send({
          body: "Found them, these sheets are actually made of dreams!",
        })
        .expect(200)
        .then(({ body: { comment } }) => {
          expect(comment).toMatchObject({
            comment_id: 2,
            body: "Found them, these sheets are actually made of dreams!",
            article_id: 1,
            author: "butter_bridge",
            votes: 14,
            created_at: "2020-10-31T03:03:00.000Z",
          });
        });
    });
    test("PATCH 200: body: correctly updates comment in data", () => {
      return request(app)
        .patch("/api/comments/2")
        .send({
          body: "Found them, these sheets are actually made of dreams!",
        })
        .expect(200)
        .then((_) => {
          return request(app)
            .get("/api/articles/1/comments")
            .expect(200)
            .then(({ body: { comments } }) => {
              expect(
                comments.find((comment) => comment.comment_id === 2)
              ).toMatchObject({
                comment_id: 2,
                body: "Found them, these sheets are actually made of dreams!",
                article_id: 1,
                author: "butter_bridge",
                votes: 14,
                created_at: "2020-10-31T03:03:00.000Z",
              });
            });
        });
    });
    test("PATCH 200: patch can take both a body and inc_value key", () => {
      return request(app)
        .patch("/api/comments/2")
        .send({
          body: "Here's the new body",
          inc_votes: 7,
        })
        .expect(200)
        .then(({ body: { comment } }) => {
          expect(comment).toMatchObject({
            comment_id: 2,
            body: "Here's the new body",
            article_id: 1,
            author: "butter_bridge",
            votes: 21,
            created_at: "2020-10-31T03:03:00.000Z",
          });
        });
    });
  });
  describe("DELETE", () => {
    test("DELETE 204: deletes a comment and returns no content", () => {
      return request(app)
        .delete("/api/comments/1")
        .expect(204)
        .then(({ body }) => {
          expect(body).toEqual({});
          return request(app)
            .get("/api/articles/9/comments")
            .expect(200)
            .then(({ body: { comments } }) => {
              expect(comments.length).toBe(1);
              expect(comments[0]).toMatchObject({
                comment_id: 17,
              });
            });
        });
    });
    test("DELETE 404 valid id doesn't have an associated comment to delete", () => {
      return request(app)
        .delete("/api/comments/1002")
        .expect(404)
        .then(({ body }) =>
          expect(body).toMatchObject({
            msg: "Resource not found",
            details: expect.stringMatching(/was not found in/),
          })
        );
    });
    test("DELETE 400 invalid comment_id", () => {
      return request(app)
        .delete("/api/comments/dog")
        .expect(400)
        .then(({ body: { msg } }) => expect(msg).toBe("Bad request"));
    });
  });
});

describe("Invalid endpoints", () => {
  describe("ALL", () => {
    test("404: If given a not present endpoint, returns a 404 error with appropriate message", () =>
      request(app)
        .get("/api/banana")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Endpoint not found");
        }));
  });
});
