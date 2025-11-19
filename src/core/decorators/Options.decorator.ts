import 'reflect-metadata';

export const OPTION_METADATA_KEY = Symbol('option');
export const COMMAND_OPTIONS_KEY = Symbol('commandOptions');

export interface OptionMetadata {
  name: string;
  type: number;
  description: string;
  required?: boolean;
  choices?: Array<{ name: string; value: string | number }>;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  autocomplete?: boolean;
}

// Decorator for command options on method parameters
export function Option(metadata: OptionMetadata): ParameterDecorator {
  return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    if (!propertyKey) return;
    const existingOptions: Map<number, OptionMetadata> =
      Reflect.getMetadata(OPTION_METADATA_KEY, target, propertyKey) || new Map();
    existingOptions.set(parameterIndex, metadata);
    Reflect.defineMetadata(OPTION_METADATA_KEY, existingOptions, target, propertyKey);
  };
}

// Helper decorators for common option types
export function String(options: {
  name: string;
  description: string;
  required?: boolean;
  choices?: Array<{ name: string; value: string }>;
  minLength?: number;
  maxLength?: number;
  max?: number;
}): ParameterDecorator {
  return Option({
    name: options.name,
    type: 3, // STRING
    description: options.description,
    required: options.required ?? false,
    choices: options.choices,
    minLength: options.minLength,
    maxLength: options.maxLength ?? options.max,
  });
}

export function Integer(options: {
  name: string;
  description: string;
  required?: boolean;
  choices?: Array<{ name: string; value: number }>;
  minValue?: number;
  maxValue?: number;
}): ParameterDecorator {
  return Option({
    name: options.name,
    type: 4, // INTEGER
    description: options.description,
    required: options.required ?? false,
    choices: options.choices,
    minValue: options.minValue,
    maxValue: options.maxValue,
  });
}

export function Boolean(options: {
  name: string;
  description: string;
  required?: boolean;
}): ParameterDecorator {
  return Option({
    name: options.name,
    type: 5, // BOOLEAN
    description: options.description,
    required: options.required ?? false,
  });
}

export function User(options: {
  name: string;
  description: string;
  required?: boolean;
}): ParameterDecorator {
  return Option({
    name: options.name,
    type: 6, // USER
    description: options.description,
    required: options.required ?? false,
  });
}

export function Channel(options: {
  name: string;
  description: string;
  required?: boolean;
}): ParameterDecorator {
  return Option({
    name: options.name,
    type: 7, // CHANNEL
    description: options.description,
    required: options.required ?? false,
  });
}

export function Role(options: {
  name: string;
  description: string;
  required?: boolean;
}): ParameterDecorator {
  return Option({
    name: options.name,
    type: 8, // ROLE
    description: options.description,
    required: options.required ?? false,
  });
}

export function getOptionMetadata(
  target: any,
  propertyKey: string | symbol
): Map<number, OptionMetadata> | undefined {
  return Reflect.getMetadata(OPTION_METADATA_KEY, target, propertyKey);
}
