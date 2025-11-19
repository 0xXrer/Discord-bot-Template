import 'reflect-metadata';
import { Command, getCommandMetadata } from '../Command.decorator';

describe('Command Decorator', () => {
  it('should add command metadata to class', () => {
    @Command('test', 'Test command')
    class TestCommand {}

    const metadata = getCommandMetadata(TestCommand);
    expect(metadata).toBeDefined();
    expect(metadata?.name).toBe('test');
    expect(metadata?.description).toBe('Test command');
  });

  it('should handle multiple decorated classes', () => {
    @Command('test1', 'Test command 1')
    class TestCommand1 {}

    @Command('test2', 'Test command 2')
    class TestCommand2 {}

    const metadata1 = getCommandMetadata(TestCommand1);
    const metadata2 = getCommandMetadata(TestCommand2);

    expect(metadata1?.name).toBe('test1');
    expect(metadata2?.name).toBe('test2');
  });

  it('should return undefined for non-decorated class', () => {
    class TestCommand {}

    const metadata = getCommandMetadata(TestCommand);
    expect(metadata).toBeUndefined();
  });
});
