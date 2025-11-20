import chalk from 'chalk';

export class Logger {
  static info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  static success(message: string): void {
    console.log(chalk.green('✔'), message);
  }

  static error(message: string): void {
    console.log(chalk.red('✖'), message);
  }

  static warn(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  static step(step: number, total: number, message: string): void {
    console.log(chalk.cyan(`[${step}/${total}]`), message);
  }

  static header(message: string): void {
    console.log();
    console.log(chalk.bold.blue('═'.repeat(50)));
    console.log(chalk.bold.blue(message));
    console.log(chalk.bold.blue('═'.repeat(50)));
    console.log();
  }

  static nextSteps(steps: string[]): void {
    console.log();
    console.log(chalk.bold.green('🎉 Project created successfully!'));
    console.log();
    console.log(chalk.bold('Next steps:'));
    steps.forEach((step, index) => {
      console.log(chalk.gray(`  ${index + 1}.`), chalk.white(step));
    });
    console.log();
  }
}
