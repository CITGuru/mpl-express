const mongoose = require("mongoose");
const { Schema } = mongoose;

const FixtureSchema = new Schema({
  team_A: {
    type: String,
    required: true,
    ref: "Team"
  },
  team_B: {
    type: String,
    required: true,
    ref: "Team"
  },
  venue: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  scores: {
    team_A: Number,
    team_B: Number
  },
  created: {
    type: Date,
    default: Date.now
  }
});

FixtureSchema.virtual("score").get(function() {
  const user = this;
  const score = `${user.scores.team_A}-${user.scores.team_B}`;

  return score;
});
const Fixture = mongoose.model("Fixture", FixtureSchema);
module.exports = Fixture;
