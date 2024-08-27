const request = require("supertest");

const app = require("../app");
const db = require("../db/connection");

const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("/api", () => {
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

describe("/api/topics", () => {
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

describe("/api/articles", () => {
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
});

describe("/api/articles/:article_id", () => {
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

describe("/api/articles/:article_id/comments", () => {
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
  test("POST 404: article id not found", () => {
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
  test("POST 400: article id invalid", () => {
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
  test.todo("POST 400: provided body doesn't contain a valid username or body");
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
