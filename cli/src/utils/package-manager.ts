import { execa } from 'execa';
import type { PackageManager } from '../types';

export class PackageManagerUtil {
  static getInstallCommand(pm: PackageManager): string {
    switch (pm) {
      case 'npm':
        return 'install';
      case 'pnpm':
        return 'install';
      case 'yarn':
        return 'install';
      case 'bun':
        return 'install';
      default:
        return 'install';
    }
  }

  static async install(pm: PackageManager, cwd: string): Promise<void> {
    const command = this.getInstallCommand(pm);
    await execa(pm, [command], { cwd, stdio: 'inherit' });
  }

  static async isAvailable(pm: PackageManager): Promise<boolean> {
    try {
      await execa(pm, ['--version']);
      return true;
    } catch {
      return false;
    }
  }

  static async detectPreferred(): Promise<PackageManager> {
    const managers: PackageManager[] = ['bun', 'pnpm', 'yarn', 'npm'];

    for (const pm of managers) {
      if (await this.isAvailable(pm)) {
        return pm;
      }
    }

    return 'npm'; // Default fallback
  }
}
