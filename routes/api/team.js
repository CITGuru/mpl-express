const express = require("express");
const Team = require("../../models/Team");
const validator = require("../../validation/validator");
const { createTeamSchema, editTeamSchema } = require("../../validation/schema");

const router = express.Router();

const auth = require("../../middlewares/auth");

router.post(
  "/",
  [auth.authenticate, auth.isAdmin, validator.body(createTeamSchema)],
  async (req, res) => {
    try {
      const foundTeam = await Team.findOne({ team_name: req.body.team_name });
      if (foundTeam) {
        res.status(400).send({ error: "Team name is already registered" });
      }
      const {
        team_name,
        slogan,
        trophies,
        location,
        year_founded,
        stadium,
        manager
      } = req.body;
      const newTeam = new Team({
        team_name,
        location,
        year_founded,
        stadium,
        manager,
        trophies,
        slogan
      });
      await newTeam.save();
      const response = {
        id: newTeam.id,
        team_name,
        location,
        year_founded,
        stadium,
        manager,
        trophies,
        slogan
      };
      res.status(201).send(response);
    } catch (err) {
      res.status(400).send(err);
    }
  }
);
router.get("/", [auth.authenticate], async (req, res) => {
  try {
    Team.find()
      // .sort({ date: -1 })
      .then(teams => res.json(teams));
  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/:team_id", [auth.authenticate], async (req, res) => {
  try {
    Team.findById(req.params.team_id)
      .then(team => res.json(team))
      .catch(err =>
        res.status(404).json({ error: "This team does not exist" })
      );
  } catch (error) {
    res.status(500).send(error);
  }
});

router.put(
  "/:team_id",
  [auth.authenticate, auth.isAdmin, validator.body(editTeamSchema)],
  (req, res) => {
    try {
      Team.findByIdAndUpdate(req.params.team_id, req.body, { new: true })
        .then(team => {
          res.json(team);
        })
        .catch(err =>
          res.status(404).json({ error: "This team does not exist" })
        );
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

router.delete("/:team_id", [auth.authenticate, auth.isAdmin], (req, res) => {
  try {
    Team.findById(req.params.team_id)
      .then(team =>
        team
          .remove()
          .then(resp =>
            res.status(204).json({ id: req.params.team_id, success: true })
          )
      )
      .catch(err =>
        res.status(404).json({ error: "This team does not exist" })
      );
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
