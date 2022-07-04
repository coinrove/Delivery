const fs = require('fs')
const YAML = require("js-yaml");
const config = require('./config');

function saveConfig()
{
  fs.writeFileSync("./config.yaml", YAML.dump(config));
}

module.exports = () => 
{
  ["exit", "SIGINT", "uncaughtException", "SIGTERM"].forEach((eventType) => {
    process.on(eventType, (code) => 
    {
      saveConfig();
      process.exit(code);
    });
  })
};