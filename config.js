const fs = require("fs");
const YAML = require("js-yaml");

module.exports = YAML.load(fs.readFileSync("./config.yaml", "utf-8"));