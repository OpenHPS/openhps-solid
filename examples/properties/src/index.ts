import { SolidClientService } from '@openhps/solid';
import inquirer from 'inquirer';
import chalk from 'chalk';

const service = new SolidClientService({
  clientName: "Solid Properties",
});

inquirer.prompt([
    {
        type: 'input',
        name: 'provider',
        message: 'Enter your Solid Pod provider:',
        default: 'https://solidweb.org'
    }
]).then((answers: { provider: any; }) => {
    console.log(chalk.green(`Logging in to ${answers.provider}...`));
    return service.interactiveLogin(answers.provider);
}).then(() => {
    console.log(chalk.green('Login successful!'));
}).catch((error: string) => {
    console.error(chalk.red('Login failed:', error));
});
