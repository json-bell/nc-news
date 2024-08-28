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
          topics.forEach((topic) => {
            expect(topic).toMatchObject({
              slug: expect.any(String),
              description: expect.any(String),
            });
          });
        });
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

describe("/api/articles", () => {
  describe("GET", () => {
    test("GET 200: finds all articles", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(13);
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
        });
    });
    test("GET 200: counts comments on articles", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(
            articles.find((article) => article.article_id === 1).comment_count
          ).toBe(11);
        });
    });
    test("GET 200: articles do not have a body property", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(13);
          articles.forEach((article) => {
            expect(article.hasOwnProperty("body")).toBe(false);
          });
        });
    });
    test("GET 200: articles sort by date in descending order by default", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("GET 200: takes a sort_by query that sorts by any valid column", () => {
      return request(app)
        .get("/api/articles?sort_by=title")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(13);
          expect(articles).toBeSortedBy("title", { descending: true });
        });
    });
    test("GET 200: takes a order query, asc sorts by ascending", () => {
      return request(app)
        .get("/api/articles?order=desc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(13);
          expect(articles).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("GET 200: takes a order query, desc sorts by descending", () => {
      return request(app)
        .get("/api/articles?order=asc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(13);
          expect(articles).toBeSortedBy("created_at");
        });
    });
    test("GET 200: combines these", () => {
      return request(app)
        .get("/api/articles?sort_by=article_id&order=asc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(13);
          expect(articles).toBeSortedBy("article_id");
        });
    });
    test("GET 400: order not valid", () => {
      return request(app)
        .get("/api/articles?order=not-an-order")
        .expect(400)
        .then(({ body: { msg } }) => expect(msg).toBe("Bad request"));
    });
    test("GET 400: invalid column name to sort by", () => {
      return request(app)
        .get("/api/articles?sort_by=not-a-column")
        .expect(400)
        .then(({ body: { msg } }) => expect(msg).toBe("Bad request"));
    });
    test("GET 200: filters topic if given a query", () => {
      return request(app)
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(12);
          articles.forEach((article) => {
            expect(article.topic).toBe("mitch");
          });
        });
    });
    test("GET 200: returns an empty array for a valid topic with no associated articles", () => {
      return request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toEqual([]);
        });
    });
    test("GET 404: if given topic that isn't in database responds with a 404", () => {
      return request(app)
        .get("/api/articles?topic=bananas")
        .expect(404)
        .then(({ body: { msg } }) => expect(msg).toBe("Resource not found"));
    });
  });
});

describe("/api/articles/:article_id", () => {
  describe("GET", () => {
    test("GET 200: finds article by its id", () => {
      return request(app)
        .get("/api/articles/3")
        .expect(200)
        .then(({ body: { article } }) => {
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
          });
        });
    });
    test("GET 404: returns Not Found message if id is valid but not present", () => {
      return request(app)
        .get("/api/articles/8080")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Resource not found");
        });
    });
    test("GET 400: returns Bad Request message if id is invalid", () => {
      return request(app)
        .get("/api/articles/dog")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });
  describe("PATCH", () => {
    test("PATCH 200: responds with article with updated vote count", () => {
      return request(app)
        .patch("/api/articles/13")
        .send({ inc_votes: 6 })
        .expect(200)
        .then(({ body: { article } }) => {
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
          });
        });
    });
    test("PATCH 200: correctly increases vote count", () => {
      return request(app)
        .patch("/api/articles/1")
        .send({ inc_votes: 6 })
        .expect(200)
        .then(() => {
          return request(app)
            .get("/api/articles/1")
            .expect(200)
            .then(({ body: { article } }) => {
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
              });
            });
        });
    });
    test("PATCH 200: correctly decreases vote count", () => {
      return request(app)
        .patch("/api/articles/1")
        .send({ inc_votes: -25 })
        .expect(200)
        .then(() => {
          return request(app)
            .get("/api/articles/1")
            .expect(200)
            .then(({ body: { article } }) => {
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
              });
            });
        });
    });
    test("PATCH 200: responds with the unmodified article if no correct patch keys in payload", () => {
      return request(app)
        .patch("/api/articles/13")
        .send({ not_good_key: 6 })
        .expect(200)
        .then(({ body: { article } }) => {
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
          });
        });
    });
    test("PATCH 404: responds not found if id is valid but not present", () => {
      return request(app)
        .patch("/api/articles/8000")
        .send({ inc_votes: 6 })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Resource not found");
        });
    });
    test("PATCH 400: responds bad request if id is invalid", () => {
      return request(app)
        .patch("/api/articles/banana")
        .send({ inc_votes: 6 })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("PATCH 400: responds bad request if inc_votes isn't an integer", () => {
      return request(app)
        .patch("/api/articles/3")
        .send({ inc_votes: "seven yay" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("PATCH 200: body: correctly responds with the updated article", () => {
      return request(app)
        .patch("/api/articles/13")
        .send({
          body: "This is a better body, Mitch is still great though!",
        })
        .expect(200)
        .then(({ body: { article: respondedArticle } }) => {
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
          expect(respondedArticle).toMatchObject(expectedResponse);
        });
    });
    test("PATCH 200: body: correctly responds with the updated article", () => {
      return request(app)
        .patch("/api/articles/13")
        .send({
          body: "This is a better body, Mitch is still great though!",
        })
        .expect(200)
        .then(({ body: { article: respondedArticle } }) => {
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
          return request(app)
            .get("/api/articles/13")
            .expect(200)
            .then(({ body: { article } }) => {
              expect(article).toMatchObject(expectedResponse);
            });
        });
    });
    test("PATCH 200: dynamically updates according to body, title or topic", () => {
      return request(app)
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
        });
    });
    test("PATCH 200: dynamically responds according to body, title or topic", () => {
      return request(app)
        .patch("/api/articles/13")
        .send({
          topic: "cats",
        })
        .expect(200)
        .then(({ body: { article: respondedArticle } }) => {
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
          return request(app)
            .get("/api/articles/13")
            .expect(200)
            .then(({ body: { article } }) => {
              expect(article).toMatchObject(expectedResponse);
            });
        });
    });
    test("PATCH 200: Combines these behaviours", () => {
      return request(app)
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
        });
    });
    // are there any sad paths for title and body? Or can SQL convert everything to a string
    test("PATCH 404: if given a topic that doesn't exist, responds with a 400", () => {
      return request(app)
        .patch("/api/articles/4")
        .send({ topic: "not-a-topic" })
        .expect(404)
        .then(({ body: { msg } }) => expect(msg).toBe("Resource not found"));
    });
  });
});

describe("/api/articles/:article_id/comments", () => {
  describe("GET", () => {
    test("GET 200: responds with an empty array if the article has no comments", () => {
      return request(app)
        .get("/api/articles/8/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toEqual([]);
        });
    });
    test("GET 200: finds an article's comments by its id if it has comments", () => {
      return request(app)
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
        });
    });
    test("GET 200: comments are sorted with most recent comments first", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("GET 404: returns Not Found message if article id is valid but not present", () => {
      return request(app)
        .get("/api/articles/8080/comments")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Resource not found");
        });
    });
    test("GET 400: returns Bad Request message if article id is invalid", () => {
      return request(app)
        .get("/api/articles/dog/comments")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
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
        .then(({ body: { comment } }) => {
          expect(comment).toMatchObject({
            author: "rogersop",
            body: "This is amazing",
            comment_id: expect.any(Number),
            article_id: 9,
            votes: 0,
          });
        });
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
        .then(({ body: { comment: newComment } }) => {
          return request(app)
            .get("/api/articles/9/comments")
            .expect(200)
            .then(({ body: { comments } }) => {
              expect(
                comments.find(
                  (comment) => comment.comment_id === newComment.comment_id
                )
              ).toMatchObject({
                author: "rogersop",
                body: "This is amazing",
                comment_id: expect.any(Number),
                article_id: 9,
                votes: 0,
              });
            });
        });
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
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Resource not found");
        });
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
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Resource not found");
        })
        .then(() => {
          return request(app)
            .get("/api/articles/13/comments")
            .expect(200)
            .then(({ body: { comments } }) => expect(comments.length).toBe(0));
        });
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
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
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
          return request(app)
            .get("/api/articles/13/comments")
            .expect(200)
            .then(({ body: { comments } }) => expect(comments.length).toBe(0));
        });
    });
  });
});

describe("/api/comments/:comment_id", () => {
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
        .then(({ body: { msg } }) => expect(msg).toBe("Resource not found"));
    });
    test("DELETE 400 invalid comment_id", () => {
      return request(app)
        .delete("/api/comments/dog")
        .expect(400)
        .then(({ body: { msg } }) => expect(msg).toBe("Bad request"));
    });
  });
});

describe("Invalid endpoint returns 404 and message indicating URL was not found", () => {
  test("404: If given a not present endpoint, returns a 404 error with appropriate message", () => {
    return request(app)
      .get("/api/banana")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Endpoint not found");
      });
  });
});
