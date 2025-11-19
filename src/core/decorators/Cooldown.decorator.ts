import 'reflect-metadata';

export const COOLDOWN_METADATA_KEY = Symbol('cooldown');

export function Cooldown(milliseconds: number): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(COOLDOWN_METADATA_KEY, milliseconds, target);
  };
}

export function getCooldownMetadata(target: any): number | undefined {
  return Reflect.getMetadata(COOLDOWN_METADATA_KEY, target);
}
