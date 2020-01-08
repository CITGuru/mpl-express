const chai = require("chai");
const chaiHttp = require("chai-http");

// import app from "../server";
const { TestDB } = require("../db");

const db = new TestDB();

const expect = require("chai").expect;
let app = require("../server");

let User = require("../models/User");

chai.use(chaiHttp);
chai.should();

const adminUser = {
  name: "Oyetoke Toby",
  email: "oyetoketoby80@gmail.com",
  password: "bliqset17D*",
  is_admin: true
};

const userUser = {
  name: "Oyetoke Toby",
  email: "oyetoketoby80@gmail.com",
  password: "bliqset17D*",
  is_admin: false
};

function createUsers() {
  const admin = new User(adminUser).save();
  const user = new User(userUser).save();
  return { admin, user };
}

before(async () => {
  await db.startDB();
  // const { admin } = createUsers();
  // chai
  //   .request(app)
  //   .post("/api/v1/auth/login")
  //   .send({
  //     email: adminUser.email,
  //     password: adminUser.password
  //   })
  //   .end((err, res) => {
  //     adminUser.token = res.body.token; // save the token!
  //   });
});

after(async () => {
  await db.stopDB();
});

describe("User", () => {
  describe("POST /user /", () => {
    const userData = {
      name: "Naruto Uzumaki",
      email: "narutouzumaki@gmail.com",
      password: "narutoki1*"
    };
    it("should return a normal user record when all request body is valid", done => {
      chai
        .request(app)
        .post("/api/v1/auth/register/user")
        .send(userData)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a("object");
          expect(res.body).to.have.property("name", userData.name);
          expect(res.body).to.have.property("email", userData.email);

          done();
        });
    });

    it("It logs in the normal user", async () => {
      chai
        .request(app)
        .post("/api/v1/auth/login")
        .send({
          email: userData.email,
          password: userData.password
        })
        .end((err, res) => {
          // Ensure the results returned is correct
          res.should.have.status(200);
          expect(res.body).to.have.property("token");
        });
    });

    it("It throws an error for invalid credentials", async () => {
      chai
        .request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "fjjjhieoe@gmail.com",
          password: "tomcruiddse"
        })
        .end((err, res) => {
          res.should.have.status(400);
          expect(res.body).to.have.property("error");
          expect(res.body).to.have.property(
            "error",
            "Error: Invalid login credentials"
          );
        });

      // Ensure the results returned is correct
    });
  });
  describe("POST /admin user", () => {
    const adminData = {
      name: "Sasuke Uchiha",
      email: "sasukeuchiha@gmail.com",
      password: "sasukechi23**",
      is_admin: true
    };
    it("It returns the newly created admin user", async () => {
      chai
        .request(app)
        .post("/api/v1/auth/register/admin")
        .send(adminData)
        .end((err, res) => {
          res.should.have.status(201);
          expect(res.body).to.have.property("id");
          expect(res.body).to.have.property("name");
          expect(res.body).to.have.property("email");
          expect(res.body).to.have.property("is_admin");
          expect(res.body).to.have.property("token");
        });
    });

    it("It throws an error because of missing credentials", async () => {
      chai
        .request(app)
        .post("/api/v1/auth/register/admin")
        .send({
          email: adminData.email,
          password: adminData.password
        })
        .end((err, res) => {
          res.should.have.status(400);
          expect(res.body).to.have.property("error", '"name" is required');
        });
    });

    it("It throws an error because of missing short password", async () => {
      chai
        .request(app)
        .post("/api/v1/auth/register/admin")
        .send({
          ...adminData,
          password: "sass"
        })
        .end((err, res) => {
          res.should.have.status(400);
          expect(res.body).to.have.property(
            "error",
            '"password" length must be at least 6 characters long'
          );
        });
    });
  });
});
