import 'reflect-metadata';
import { EventMetadata } from '../interfaces/IEvent';

export const EVENT_METADATA_KEY = Symbol('event');

export function Event(name: string, once: boolean = false): ClassDecorator {
  return (target: any) => {
    const metadata: EventMetadata = {
      name,
      once,
    };
    Reflect.defineMetadata(EVENT_METADATA_KEY, metadata, target);
  };
}

export function getEventMetadata(target: any): EventMetadata | undefined {
  return Reflect.getMetadata(EVENT_METADATA_KEY, target);
}
