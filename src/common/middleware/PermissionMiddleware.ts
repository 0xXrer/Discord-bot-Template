import { singleton } from 'tsyringe';
import { IMiddleware, MiddlewareContext, NextFunction } from '@core/interfaces/IMiddleware';
import { Middleware } from '@core/decorators';
import { Member } from 'oceanic.js';

@Middleware()
@singleton()
export class PermissionMiddleware implements IMiddleware {
  public async use(context: MiddlewareContext, next: NextFunction): Promise<void> {
    const { interaction } = context;

    if (!context.requiredPermissions || context.requiredPermissions.length === 0) {
      await next();
      return;
    }

    if (!interaction.guildID) {
      await interaction.createMessage({
        content: '❌ This command requires guild permissions and can only be used in a server.',
        flags: 64,
      });
      return;
    }

    const member = interaction.member as Member | null;
    if (!member) {
      await interaction.createMessage({
        content: '❌ Could not verify your permissions.',
        flags: 64,
      });
      return;
    }

    const hasPermissions = this.checkPermissions(
      member,
      context.requiredPermissions
    );

    if (!hasPermissions) {
      await interaction.createMessage({
        content: `❌ You need the following permissions: ${context.requiredPermissions.join(', ')}`,
        flags: 64,
      });
      return;
    }

    await next();
  }

  private checkPermissions(member: Member, requiredPermissions: string[]): boolean {
    const permissions = member.permissions;

    for (const permission of requiredPermissions) {
      if (!permissions.has(permission as any)) {
        return false;
      }
    }

    return true;
  }
}
