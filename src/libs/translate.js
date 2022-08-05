// google translate
const translate = require('@vitalets/google-translate-api');
const chalk = require('chalk');
const ora = require('ora');

module.exports = async function (text, option) {
  const spinner = ora(chalk.green('google translate loading')).start();
  try {
    const { text: resultText, from } = await translate(text, {
      tld: 'cn',
      client: 'gtx',
      autoCorrect: true,
      ...option,
    });
    spinner.stop();
    console.log(chalk.green(resultText));
    if (from.text.didYouMean) {
      console.log(chalk.gray(`didYouMean: ${from.text.value} ?`));
    }
  } catch (e) {
    spinner.stop();
    console.log(chalk.red(e.message));
  }
};
