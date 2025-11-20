#!/usr/bin/env node

import { Command } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
    .name('create-discord-bot')
    .description('CLI to scaffold a Discord bot project')
    .version('1.0.0')
    .action(async () => {
        console.log(chalk.blue.bold('🚀 Welcome to the Discord Bot CLI!'));

        const response = await prompts([
            {
                type: 'text',
                name: 'projectName',
                message: 'What is the name of your project?',
                initial: 'my-discord-bot',
            },
            {
                type: 'select',
                name: 'packageManager',
                message: 'Which package manager do you want to use?',
                choices: [
                    { title: 'npm', value: 'npm' },
                    { title: 'pnpm', value: 'pnpm' },
                    { title: 'yarn', value: 'yarn' },
                    { title: 'bun', value: 'bun' },
                ],
            },
            {
                type: 'confirm',
                name: 'useDocker',
                message: 'Do you want to include Docker configuration?',
                initial: true,
            },
            {
                type: 'select',
                name: 'database',
                message: 'Which database do you want to use?',
                choices: [
                    { title: 'Prisma (PostgreSQL/MySQL/etc)', value: 'prisma' },
                    { title: 'None', value: 'none' },
                ],
            },
        ]);

        if (!response.projectName) {
            console.log(chalk.red('❌ Operation cancelled'));
            process.exit(1);
        }

        const projectPath = path.join(process.cwd(), response.projectName);

        if (fs.existsSync(projectPath)) {
            console.log(chalk.red(`❌ Directory ${response.projectName} already exists`));
            process.exit(1);
        }

        const spinner = ora('Scaffolding project...').start();

        try {
            // Clone the repository
            const repoUrl = 'https://github.com/0xXrer/Discord-bot-Template.git';
            await execa('git', ['clone', repoUrl, projectPath]);

            spinner.text = 'Customizing project...';

            // Remove .git folder to start fresh
            await fs.remove(path.join(projectPath, '.git'));
            await fs.remove(path.join(projectPath, 'cli')); // Remove CLI folder from the new project


            // Remove Docker files if not selected
            if (!response.useDocker) {
                await fs.remove(path.join(projectPath, 'Dockerfile'));
                await fs.remove(path.join(projectPath, 'docker-compose.yml'));
                await fs.remove(path.join(projectPath, '.dockerignore'));
            }

            // Handle Database
            if (response.database === 'none') {
                await fs.remove(path.join(projectPath, 'prisma'));
                // We might need to remove prisma from package.json too, but that's complex.
                // For now, just removing the folder.
            }

            // Initialize git
            await execa('git', ['init'], { cwd: projectPath });

            spinner.succeed(chalk.green('Project scaffolded successfully!'));

            console.log(chalk.yellow('\nNext steps:'));
            console.log(`  cd ${response.projectName}`);
            console.log(`  ${response.packageManager} install`);
            if (response.database === 'prisma') {
                console.log(`  ${response.packageManager} run prisma:generate`);
            }
            console.log(`  ${response.packageManager} run dev`);

        } catch (error) {
            spinner.fail(chalk.red('Failed to scaffold project'));
            console.error(error);
        }
    });

program.parse(process.argv);
