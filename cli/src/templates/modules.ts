import fs from 'fs-extra';
import path from 'path';
import type { ProjectConfig } from '../types';

export class ModulesTemplate {
  constructor(private projectPath: string, private config: ProjectConfig) {}

  async setup(): Promise<void> {
    const modulesPath = path.join(this.projectPath, 'src/modules');
    const availableModules = ['general', 'moderation'];

    // Remove modules that weren't selected
    for (const module of availableModules) {
      if (!this.config.includeModules.includes(module)) {
        await fs.remove(path.join(modulesPath, module));
      }
    }

    // Update main.ts to only register selected modules
    await this.updateMainTs();
  }

  private async updateMainTs(): Promise<void> {
    const mainTsPath = path.join(this.projectPath, 'src/main.ts');
    let content = await fs.readFile(mainTsPath, 'utf-8');

    // Build the module imports and registrations
    const moduleImports: string[] = [];
    const moduleRegistrations: string[] = [];

    if (this.config.includeModules.includes('general')) {
      moduleImports.push("import { GeneralModule } from '@modules/general/general.module';");
      moduleRegistrations.push(`  // Register General Module
  const generalModule = container.resolve(GeneralModule);
  await generalModule.initialize(client);
  client.registerModule(generalModule);`);
    }

    if (this.config.includeModules.includes('moderation')) {
      moduleImports.push("import { ModerationModule } from '@modules/moderation/moderation.module';");
      moduleRegistrations.push(`  // Register Moderation Module
  const moderationModule = container.resolve(ModerationModule);
  await moderationModule.initialize(client);
  client.registerModule(moderationModule);`);
    }

    // Find and replace the module registration section
    // This is a simplified approach - you might need to adjust based on actual main.ts structure
    const moduleImportRegex = /\/\/ Module imports[\s\S]*?(?=\/\/ Initialize|import)/;
    const moduleRegisterRegex = /\/\/ Register modules[\s\S]*?(?=\/\/ Connect|await client\.connect)/;

    if (moduleImports.length > 0) {
      content = content.replace(
        /import { GeneralModule }[\s\S]*?import { ModerationModule }[^\n]*\n/,
        moduleImports.join('\n') + '\n'
      );

      content = content.replace(
        /\/\/ Register General Module[\s\S]*?client\.registerModule\(moderationModule\);/,
        moduleRegistrations.join('\n\n')
      );
    }

    await fs.writeFile(mainTsPath, content);
  }
}
