const common = [
  'test/features/**/*.feature',
  '--require test/**/*.ts',
  `--format-options '{"snippetInterface": "async-await"}'`,
  '--require-module ts-node/register',
].join(' ');
module.exports = {
  default: common,
};
