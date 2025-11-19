import 'reflect-metadata';

export const GUARDS_METADATA_KEY = Symbol('guards');

export interface GuardOptions {
  permissions?: string[];
  guildOnly?: boolean;
  dmOnly?: boolean;
  ownerOnly?: boolean;
  nsfw?: boolean;
}

export function RequirePermissions(...permissions: string[]): ClassDecorator {
  return (target: any) => {
    const existingGuards: GuardOptions = Reflect.getMetadata(GUARDS_METADATA_KEY, target) || {};
    existingGuards.permissions = [...(existingGuards.permissions || []), ...permissions];
    Reflect.defineMetadata(GUARDS_METADATA_KEY, existingGuards, target);
  };
}

export function GuildOnly(): ClassDecorator {
  return (target: any) => {
    const existingGuards: GuardOptions = Reflect.getMetadata(GUARDS_METADATA_KEY, target) || {};
    existingGuards.guildOnly = true;
    Reflect.defineMetadata(GUARDS_METADATA_KEY, existingGuards, target);
  };
}

export function DMOnly(): ClassDecorator {
  return (target: any) => {
    const existingGuards: GuardOptions = Reflect.getMetadata(GUARDS_METADATA_KEY, target) || {};
    existingGuards.dmOnly = true;
    Reflect.defineMetadata(GUARDS_METADATA_KEY, existingGuards, target);
  };
}

export function OwnerOnly(): ClassDecorator {
  return (target: any) => {
    const existingGuards: GuardOptions = Reflect.getMetadata(GUARDS_METADATA_KEY, target) || {};
    existingGuards.ownerOnly = true;
    Reflect.defineMetadata(GUARDS_METADATA_KEY, existingGuards, target);
  };
}

export function NSFW(): ClassDecorator {
  return (target: any) => {
    const existingGuards: GuardOptions = Reflect.getMetadata(GUARDS_METADATA_KEY, target) || {};
    existingGuards.nsfw = true;
    Reflect.defineMetadata(GUARDS_METADATA_KEY, existingGuards, target);
  };
}

export function getGuardsMetadata(target: any): GuardOptions | undefined {
  return Reflect.getMetadata(GUARDS_METADATA_KEY, target);
}
