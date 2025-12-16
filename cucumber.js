module.exports = {
  default: {
    require: [
      "features/world.js",
      "features/steps/*.js"
    ],
    publishQuiet: true,
    timeout: 60000
  }
};
