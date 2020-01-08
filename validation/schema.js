const Joi = require("@hapi/joi");

const id = Joi.string();
const number = Joi.number();

const date = Joi.date();

const name = Joi.string().regex(/^\D+$/);
const team_name = Joi.string();
const string = Joi.string();

const email = Joi.string()
  .email()
  .lowercase()
  .required();

const password = Joi.string()
  .min(6)
  .required()
  .strict();

const createUserSchema = Joi.object({
  name: name.required(),
  email,
  password
});

const createUserAdminSchema = Joi.object({
  name: name.required(),
  email,
  password,
  is_admin: Joi.boolean().default(true)
});
const userLoginSchema = Joi.object({
  email,
  password
});
const createTeamSchema = Joi.object({
  team_name: team_name.required(),
  location: name.required(),
  year_founded: date.required(),
  manager: name.required(),
  stadium: name.required(),
  trophies: number.required(),
  slogan: name.required()
});
const editTeamSchema = Joi.object({
  team_name: team_name,
  location: name,
  year_founded: date,
  manager: name,
  stadium: name,
  trophies: number,
  slogan: name
});
const createFixtureSchema = Joi.object({
  team_A: id.required(),
  team_B: id.required(),
  venue: string.required(),
  date: date.required(),
  time: string.required(),
  status: name.valid("pending", "completed").required()
});
const editFixtureSchema = Joi.object({
  team_A: id,
  team_B: id,
  venue: name,
  date,
  time: string,
  status: name.valid("pending", "completed"),
  scores: Joi.object({
    team_A: number.required(),
    team_B: number.required()
  })
});

module.exports = {
  createUserAdminSchema,
  createUserSchema,
  userLoginSchema,
  createTeamSchema,
  editTeamSchema,
  createFixtureSchema,
  editFixtureSchema
};
