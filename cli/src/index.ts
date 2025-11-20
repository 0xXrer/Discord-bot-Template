#!/usr/bin/env node

import { Command } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ProjectConfig } from './types';
import { PackageManagerUtil } from './utils/package-manager';
import { FileGenerator } from './utils/file-generator';
import { DatabaseTemplate } from './templates/database';
import { DockerTemplate } from './templates/docker';
import { ModulesTemplate } from './templates/modules';
import { Logger } from './utils/logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name('create-discord-bot')
  .description('CLI to scaffold a modern Discord bot project with Oceanic.js')
  .version('2.0.0')
  .argument('[project-name]', 'Name of your project')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .option('-pm, --package-manager <manager>', 'Package manager to use (npm, pnpm, yarn, bun)')
  .option('--no-docker', 'Skip Docker configuration')
  .option('--no-install', 'Skip dependency installation')
  .option('--no-git', 'Skip git initialization')
  .action(async (projectNameArg, options) => {
    Logger.header('🚀 Discord Bot Template CLI v2.0');

    let config: ProjectConfig;

    if (options.yes) {
      // Use defaults
      const projectName = projectNameArg || 'my-discord-bot';
      const packageManager = options.packageManager || (await PackageManagerUtil.detectPreferred());

      config = {
        projectName,
        packageManager,
        useDocker: options.docker !== false,
        database: 'prisma-postgres',
        includeModules: ['general', 'moderation'],
        gitInit: options.git !== false,
        installDeps: options.install !== false,
      };
    } else {
      // Interactive prompts
      const response = await prompts([
        {
          type: projectNameArg ? null : 'text',
          name: 'projectName',
          message: 'What is the name of your project?',
          initial: 'my-discord-bot',
          validate: (value) => {
            if (!value) return 'Project name is required';
            if (!/^[a-z0-9-_]+$/.test(value)) {
              return 'Project name can only contain lowercase letters, numbers, hyphens, and underscores';
            }
            return true;
          },
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
          initial: 0,
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
            { title: 'Prisma with PostgreSQL', value: 'prisma-postgres' },
            { title: 'Prisma with MySQL', value: 'prisma-mysql' },
            { title: 'Prisma with SQLite', value: 'prisma-sqlite' },
            { title: 'Supabase', value: 'supabase' },
            { title: 'None (no database)', value: 'none' },
          ],
          initial: 0,
        },
        {
          type: 'multiselect',
          name: 'includeModules',
          message: 'Which modules do you want to include?',
          choices: [
            { title: 'General (ping, help, info)', value: 'general', selected: true },
            { title: 'Moderation (ban, kick, warn)', value: 'moderation', selected: true },
          ],
          min: 1,
          hint: '- Space to select. Return to submit',
        },
        {
          type: 'confirm',
          name: 'gitInit',
          message: 'Initialize a git repository?',
          initial: true,
        },
        {
          type: 'confirm',
          name: 'installDeps',
          message: 'Install dependencies automatically?',
          initial: true,
        },
      ]);

      if (!response.projectName && !projectNameArg) {
        Logger.error('Operation cancelled');
        process.exit(1);
      }

      config = {
        projectName: projectNameArg || response.projectName,
        packageManager: response.packageManager,
        useDocker: response.useDocker,
        database: response.database,
        includeModules: response.includeModules || ['general'],
        gitInit: response.gitInit,
        installDeps: response.installDeps,
      };
    }

    const projectPath = path.join(process.cwd(), config.projectName);

    // Check if directory exists
    if (await fs.pathExists(projectPath)) {
      Logger.error(`Directory "${config.projectName}" already exists`);
      process.exit(1);
    }

    try {
      // Step 1: Clone repository
      Logger.step(1, 6, 'Cloning template repository...');
      const spinner = ora('Downloading template...').start();

      const repoUrl = 'https://github.com/0xXrer/Discord-bot-Template.git';
      await execa('git', ['clone', '--depth', '1', repoUrl, projectPath], {
        stdio: 'pipe',
      });

      spinner.succeed('Template downloaded');

      // Step 2: Clean up
      Logger.step(2, 6, 'Cleaning up template files...');
      spinner.start('Removing unnecessary files...');

      await fs.remove(path.join(projectPath, '.git'));
      await fs.remove(path.join(projectPath, 'cli')); // Remove CLI from the project
      await fs.remove(path.join(projectPath, '.github')); // Remove GitHub workflows
      await fs.remove(path.join(projectPath, 'CLAUDE.md')); // Remove AI instructions

      spinner.succeed('Cleanup complete');

      // Step 3: Configure database
      Logger.step(3, 6, `Configuring database (${config.database})...`);
      spinner.start('Setting up database...');

      const dbTemplate = new DatabaseTemplate(projectPath, config);
      await dbTemplate.setup();

      spinner.succeed('Database configured');

      // Step 4: Configure Docker
      Logger.step(4, 6, config.useDocker ? 'Configuring Docker...' : 'Removing Docker files...');
      spinner.start(config.useDocker ? 'Setting up Docker...' : 'Removing Docker...');

      const dockerTemplate = new DockerTemplate(projectPath, config);
      await dockerTemplate.setup();

      spinner.succeed(config.useDocker ? 'Docker configured' : 'Docker files removed');

      // Step 5: Configure modules
      Logger.step(5, 6, 'Configuring modules...');
      spinner.start('Setting up modules...');

      const modulesTemplate = new ModulesTemplate(projectPath, config);
      await modulesTemplate.setup();

      spinner.succeed(`Modules configured (${config.includeModules.join(', ')})`);

      // Step 6: Generate project files
      Logger.step(6, 6, 'Generating project files...');
      spinner.start('Creating configuration files...');

      const fileGenerator = new FileGenerator(projectPath, config);
      await fileGenerator.generateEnvFile();
      await fileGenerator.updatePackageJson();
      await fileGenerator.generateGitignore();

      spinner.succeed('Project files generated');

      // Initialize git
      if (config.gitInit) {
        spinner.start('Initializing git repository...');
        await execa('git', ['init'], { cwd: projectPath });
        await execa('git', ['add', '.'], { cwd: projectPath });
        await execa('git', ['commit', '-m', 'Initial commit from create-discord-bot'], {
          cwd: projectPath,
        });
        spinner.succeed('Git repository initialized');
      }

      // Install dependencies
      if (config.installDeps) {
        spinner.start(`Installing dependencies with ${config.packageManager}...`);
        await PackageManagerUtil.install(config.packageManager, projectPath);
        spinner.succeed('Dependencies installed');

        // Generate Prisma client if using Prisma
        if (config.database.startsWith('prisma')) {
          spinner.start('Generating Prisma client...');
          const prismCmd = config.packageManager === 'npm' ? 'npx' : config.packageManager;
          await execa(prismCmd, ['prisma', 'generate'], {
            cwd: projectPath,
            stdio: 'pipe',
          });
          spinner.succeed('Prisma client generated');
        }
      }

      // Show next steps
      const nextSteps: string[] = [];

      if (!config.installDeps) {
        nextSteps.push(`cd ${config.projectName}`);
        nextSteps.push(`${config.packageManager} install`);

        if (config.database.startsWith('prisma')) {
          nextSteps.push(`${config.packageManager} run prisma:generate`);
        }
      } else {
        nextSteps.push(`cd ${config.projectName}`);
      }

      nextSteps.push('Configure your .env file with your bot token and credentials');

      if (config.database.startsWith('prisma')) {
        if (config.useDocker) {
          nextSteps.push('Start the database: docker-compose up -d postgres');
        }
        nextSteps.push(`Run migrations: ${config.packageManager} run prisma:migrate`);
      }

      if (config.database === 'supabase') {
        nextSteps.push('Set up your Supabase project and add credentials to .env');
        nextSteps.push('Apply migrations from supabase/migrations/ in your Supabase dashboard');
      }

      nextSteps.push(`Start development server: ${config.packageManager} run dev`);

      Logger.nextSteps(nextSteps);

      // Show additional info
      console.log(chalk.dim('Documentation:'));
      console.log(chalk.dim('  • Oceanic.js: https://docs.oceanic.ws/'));
      console.log(chalk.dim('  • Discord Developer Portal: https://discord.com/developers/applications'));

      if (config.database === 'supabase') {
        console.log(chalk.dim('  • Supabase: https://supabase.com/docs'));
      } else if (config.database.startsWith('prisma')) {
        console.log(chalk.dim('  • Prisma: https://www.prisma.io/docs'));
      }

      console.log();
      console.log(chalk.bold.green('Happy coding! 🚀'));
      console.log();
    } catch (error) {
      Logger.error('Failed to create project');
      console.error(error);
      process.exit(1);
    }
  });

program.parse(process.argv);
