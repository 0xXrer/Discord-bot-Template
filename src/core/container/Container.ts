import 'reflect-metadata';
import { container as tsyringeContainer, DependencyContainer } from 'tsyringe';

export class Container {
  private static instance: DependencyContainer = tsyringeContainer;

  public static get<T>(token: any): T {
    return this.instance.resolve<T>(token);
  }

  public static register<T>(token: any, value: T): void {
    this.instance.register(token, { useValue: value });
  }

  public static registerSingleton<T>(token: any, target?: any): void {
    if (target) {
      this.instance.registerSingleton(token, target);
    } else {
      this.instance.registerSingleton(token);
    }
  }

  public static registerClass<T>(token: any, target: any): void {
    this.instance.register(token, { useClass: target });
  }

  public static isRegistered(token: any): boolean {
    return this.instance.isRegistered(token);
  }

  public static reset(): void {
    this.instance.reset();
  }

  public static createChildContainer(): DependencyContainer {
    return this.instance.createChildContainer();
  }

  public static getContainer(): DependencyContainer {
    return this.instance;
  }
}

export const Inject = (token: any): ParameterDecorator => {
  return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const existingInjections: Map<number, any> =
      Reflect.getMetadata('custom:injections', target) || new Map();
    existingInjections.set(parameterIndex, token);
    Reflect.defineMetadata('custom:injections', existingInjections, target);
  };
};
