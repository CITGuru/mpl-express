const express = require("express");
const Fixture = require("../../models/Fixture");
const Team = require("../../models/Team");

const validator = require("../../validation/validator");
const {
  createFixtureSchema,
  editFixtureSchema
} = require("../../validation/schema");

const router = express.Router();

const auth = require("../../middlewares/auth");

router.post(
  "/",
  [auth.authenticate, auth.isAdmin, validator.body(createFixtureSchema)],
  async (req, res) => {
    try {
      const team_A = await Team.findById(req.body.team_A);
      if (!team_A) {
        res.status(400).send({
          error: `Team A with ID ${team_A} cannot be found!`
        });
      }

      const team_B = await Team.findById(req.body.team_B);
      if (!team_B) {
        res.status(400).send({
          error: `Team B with ID ${team_A} cannot be found!`
        });
      }

      const foundFixture = await Fixture.findOne({
        team_A: team_A._id,
        team_B: team_B._id,
        date: req.body.date
      });
      if (foundFixture) {
        res.status(400).send({
          error:
            "There is already a scheduled fixture between the given teams on the same date"
        });
      }
      const { venue, date, time, status } = req.body;
      const newFixture = new Fixture({
        team_A: team_A._id,
        team_B: team_B._id,
        venue,
        date,
        time,
        status,
        scores: {
          team_A: 0,
          team_B: 0
        }
      });
      await newFixture.save();
      const response = {
        id: newFixture.id,
        team_A,
        team_B,
        venue,
        date,
        time,
        status
      };
      res.status(201).send(response);
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

router.get("/", [auth.authenticate], async (req, res) => {
  try {
    Fixture.find().then(fixtures => res.json(fixtures));
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/:fixture_id", [auth.authenticate], async (req, res) => {
  try {
    Fixture.findById(req.params.fixture_id)
      .populate("team_A")
      .populate("team_B")
      .then(fixture => res.json(fixture))
      .catch(err =>
        res.status(404).json({ error: "This fixture does not exist" })
      );
  } catch (error) {
    res.status(500).send(error);
  }
});

router.put(
  "/:fixture_id",
  [auth.authenticate, auth.isAdmin, validator.body(editFixtureSchema)],
  async (req, res) => {
    try {
      const team_A = await Team.findById(req.body.team_A);
      if (!team_A) {
        res.status(400).send({
          error: `Team A with ID ${team_A} cannot be found!`
        });
      }

      const team_B = await Team.findById(req.body.team_B);
      if (!team_B) {
        res.status(400).send({
          error: `Team B with ID ${team_A} cannot be found!`
        });
      }
      Fixture.findByIdAndUpdate(req.params.fixture_id, req.body, { new: true })
        .then(fixture => {
          res.json(fixture);
        })
        .catch(err =>
          res.status(404).json({ error: "This fixture does not exist" })
        );
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

router.delete("/:fixture_id", [auth.authenticate, auth.isAdmin], (req, res) => {
  try {
    Fixture.findById(req.params.fixture_id)
      .then(location =>
        location
          .remove()
          .then(resp =>
            res.status(204).json({ id: req.params.fixture_id, success: true })
          )
      )
      .catch(err =>
        res.status(404).json({ error: "This fixture does not exist" })
      );
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
