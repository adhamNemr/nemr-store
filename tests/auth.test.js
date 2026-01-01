const request = require("supertest");
const app = require("../app"); 

describe("Auth: Login API", () => {
  it("should login successfully with valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "adham@gmail.com",
        password: "adham"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("should fail login with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "testuser@example.com",
        password: "wrongpassword"
      });

    expect(res.statusCode).toBe(401); 
    expect(res.body).not.toHaveProperty("token");
  });
});