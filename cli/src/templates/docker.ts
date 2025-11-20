import fs from 'fs-extra';
import path from 'path';
import type { ProjectConfig } from '../types';

export class DockerTemplate {
  constructor(private projectPath: string, private config: ProjectConfig) {}

  async setup(): Promise<void> {
    if (this.config.useDocker) {
      await this.updateDockerCompose();
    } else {
      await this.removeDocker();
    }
  }

  private async removeDocker(): Promise<void> {
    await fs.remove(path.join(this.projectPath, 'Dockerfile'));
    await fs.remove(path.join(this.projectPath, 'docker-compose.yml'));
    await fs.remove(path.join(this.projectPath, '.dockerignore'));
  }

  private async updateDockerCompose(): Promise<void> {
    const dockerComposePath = path.join(this.projectPath, 'docker-compose.yml');

    let services: any = {
      bot: {
        build: '.',
        container_name: 'discord-bot',
        restart: 'unless-stopped',
        env_file: '.env',
        volumes: [
          './src:/app/src',
          './logs:/app/logs',
        ],
        depends_on: [],
      },
    };

    // Add database services based on configuration
    if (this.config.database === 'prisma-postgres') {
      services.bot.depends_on.push('postgres');
      services.postgres = {
        image: 'postgres:16-alpine',
        container_name: 'discord-bot-postgres',
        restart: 'unless-stopped',
        environment: {
          POSTGRES_USER: 'discord_bot',
          POSTGRES_PASSWORD: 'password',
          POSTGRES_DB: 'discord_bot',
        },
        volumes: ['postgres_data:/var/lib/postgresql/data'],
        ports: ['5432:5432'],
      };
    } else if (this.config.database === 'prisma-mysql') {
      services.bot.depends_on.push('mysql');
      services.mysql = {
        image: 'mysql:8',
        container_name: 'discord-bot-mysql',
        restart: 'unless-stopped',
        environment: {
          MYSQL_ROOT_PASSWORD: 'rootpassword',
          MYSQL_DATABASE: 'discord_bot',
          MYSQL_USER: 'discord_bot',
          MYSQL_PASSWORD: 'password',
        },
        volumes: ['mysql_data:/var/lib/mysql'],
        ports: ['3306:3306'],
      };
    }

    // Add Redis (optional but common)
    services.redis = {
      image: 'redis:7-alpine',
      container_name: 'discord-bot-redis',
      restart: 'unless-stopped',
      ports: ['6379:6379'],
      volumes: ['redis_data:/data'],
    };

    const dockerComposeContent = {
      version: '3.8',
      services,
      volumes: {},
    };

    // Add volumes
    if (this.config.database === 'prisma-postgres') {
      dockerComposeContent.volumes = { postgres_data: null };
    } else if (this.config.database === 'prisma-mysql') {
      dockerComposeContent.volumes = { mysql_data: null };
    }

    (dockerComposeContent.volumes as any).redis_data = null;

    // Write YAML format (simplified)
    const yamlContent = this.toYaml(dockerComposeContent);
    await fs.writeFile(dockerComposePath, yamlContent);
  }

  private toYaml(obj: any, indent = 0): string {
    let yaml = '';
    const spaces = '  '.repeat(indent);

    for (const [key, value] of Object.entries(obj)) {
      if (value === null) {
        yaml += `${spaces}${key}:\n`;
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        yaml += this.toYaml(value, indent + 1);
      } else if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        value.forEach((item) => {
          if (typeof item === 'object') {
            yaml += `${spaces}  -\n`;
            yaml += this.toYaml(item, indent + 2);
          } else {
            yaml += `${spaces}  - ${item}\n`;
          }
        });
      } else {
        yaml += `${spaces}${key}: ${value}\n`;
      }
    }

    return yaml;
  }
}
