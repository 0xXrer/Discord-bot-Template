import 'reflect-metadata';
import { CommandMetadata } from '../interfaces/ICommand';

export const COMMAND_METADATA_KEY = Symbol('command');

export function Command(name: string, description: string): ClassDecorator {
  return (target: any) => {
    const metadata: Partial<CommandMetadata> = {
      name,
      description,
    };
    Reflect.defineMetadata(COMMAND_METADATA_KEY, metadata, target);
  };
}

export function getCommandMetadata(target: any): CommandMetadata | undefined {
  return Reflect.getMetadata(COMMAND_METADATA_KEY, target);
}
