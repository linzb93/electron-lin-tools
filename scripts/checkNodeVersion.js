const semver = require("semver");
const chalk = require("chalk");
if (semver.lt(process.version, "18.0.0")) {
  console.log(chalk.red("NodeJS版本太低，请切换至v18+"));
  process.exit(1);
}
