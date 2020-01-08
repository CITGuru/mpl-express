const mongoose = require("mongoose");

const { Schema } = mongoose;

const TeamSchema = new Schema({
  team_name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  year_founded: {
    type: Date,
    required: true
  },
  stadium: {
    type: String,
    required: true
  },
  manager: {
    type: String,
    required: true
  },
  trophies: {
    type: String,
    required: true
  },
  slogan: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

TeamSchema.pre("save", async function(next) {
  // Convert year founded to string
  const user = this;
  user.year_founded = new Date(user.year_founded.toString());

  next();
});

const Team = mongoose.model("Team", TeamSchema);
module.exports = Team;
