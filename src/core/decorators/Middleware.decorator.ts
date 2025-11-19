import 'reflect-metadata';

export const MIDDLEWARE_METADATA_KEY = Symbol('middleware');

export function Middleware(): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(MIDDLEWARE_METADATA_KEY, true, target);
  };
}

export function isMiddleware(target: any): boolean {
  return Reflect.getMetadata(MIDDLEWARE_METADATA_KEY, target) === true;
}
