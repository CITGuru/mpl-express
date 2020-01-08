const chai = require("chai");
const chaiHttp = require("chai-http");

// import app from "../server";
const { TestDB } = require("../db");

const db = new TestDB();

const expect = require("chai").expect;
let app = require("../server");

let Team = require("../models/Team");
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

const teamData1 = {
  team_name: "Liverpool FC",
  location: "Liverpool",
  year_founded: 1862,
  manager: "Jurgen Klopp",
  trophies: 26,
  stadium: "Anfield",
  slogan: "You will never walk alone"
};

const teamData2 = {
  team_name: "Manchester United",
  location: "Manchester",
  year_founded: 1892,
  stadium: "Old Trafford",
  manager: "Ole Gunnar Solksjaer",
  trophies: 26,
  slogan: "Red Devils"
};
const teamData3 = {
  team_name: "Chelsea",
  location: "London",
  year_founded: 1899,
  stadium: "Stanford Bridge",
  manager: "Frank Lampard",
  trophies: 16,
  slogan: "The Blues"
};
function createMockData() {
  const admin = new User(adminUser).save();
  const user = new User(userUser).save();
  const team1 = new Team(teamData1).save();
  const team2 = new Team(teamData2).save();
  const team3 = new Team(teamData3).save();
  return { admin, user, team1, team2, team3 };
}

before(async () => {
  await db.startDB();
  const { admin, user, team1, team2, team3 } = createMockData();
  chai
    .request(app)
    .post("/api/v1/auth/login")
    .send({
      email: adminUser.email,
      password: adminUser.password
    })
    .end((err, res) => {
      adminUser.token = res.body.token; // save the token!
    });
  chai
    .request(app)
    .post("/api/v1/auth/login")
    .send({
      email: userUser.email,
      password: userUser.password
    })
    .end((err, res) => {
      userUser.token = res.body.token; // save the token!
    });
});

after(async () => {
  await db.stopDB();
});

describe("Team", () => {
  console.log([adminUser, userUser]);
  describe("POST / team", () => {
    const teamData = {
      team_name: "Burnley",
      trophies: 12,
      location: "England",
      year_founded: 1856,
      stadium: "Turf Moor",
      manager: "Sean Dyche ",
      slogan: "Home of the Clarets"
    };
    it("It responds with the newly created team", async () => {
      chai
        .request(app)
        .post("/api/v1/teams")
        .set("Authorization", `Bearer ${adminUser.token}`)
        .send(teamData)
        .end((err, res) => {
          // Ensure the results returned is correct
          res.should.have.status(201);

          expect(response.body).to.have.property("id");
          expect(response.body).to.have.property("team_name");
          expect(response.body).to.have.property("slofan");
          expect(response.body).to.have.property("location");
          expect(response.body).to.have.property("trophies");
          expect(response.body).to.have.property("year_founded");
          expect(response.body).to.have.property("manager");
        });
    });

    it("It throws an error because of duplicate team name", async () => {
      chai
        .request(app)
        .post("/api/v1/teams")
        .set("Authorization", `Bearer ${adminUser.token}`)
        .send(teamData)
        .end((err, res) => {
          res.should.have.status(400);
          expect(response.body).to.have.property(
            "error",
            "Team name is already registered"
          );
        });
    });

    it("It throws an error because of missing credentials", async () => {
      chai
        .request(app)
        .post("/api/v1/teams")
        .set("Authorization", `Bearer ${adminUser.token}`)
        .send({
          slogan: "Toffee Blues",
          trophies: 12,
          location: "Wigan",
          stadium: "Madison Park",
          year_founded: 1826,
          manager: "Roberto Martinez"
        })
        .end((err, res) => {
          res.should.have.status(400);
          expect(response.body).to.have.property(
            "error",
            '"team_name" is required'
          );
        });
    });

    it("It throws a 401 because of admin permissions", async () => {
      chai
        .request(app)
        .post("/api/v1/teams")
        .set("Authorization", `Bearer ${userUser.token}`)
        .send({
          team_name: "Wigan Athletic",
          slogan: "Toffee Blues",
          trophies: "12",
          location: "Wigan",
          stadium: "Madison Park",
          year_founded: "1826",
          manager: "Roberto Martinez"
        })
        .end((err, res) => {
          res.should.have.status(401);
          expect(response.body).to.have.property(
            "error",
            "Authorized for only admins"
          );
        });
    });
  });
});
