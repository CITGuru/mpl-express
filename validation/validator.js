const validationOptions = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true
};
const validator = require("express-joi-validation").createValidator({
  passError: true
  // joi: validationOptions
});

module.exports = validator;
