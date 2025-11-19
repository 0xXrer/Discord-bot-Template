# Discord Bot Template Documentation

Welcome to the comprehensive documentation for the **Discord Bot Template v2.0** - a modern, production-ready Discord bot framework built with TypeScript, Oceanic.js, decorators, and dependency injection.

## 📚 Documentation Index

### Getting Started
- **[Quick Start Guide](./getting-started.md)** - Get up and running in minutes
- **[Installation](./getting-started.md#installation)** - Detailed installation instructions
- **[Configuration](./getting-started.md#configuration)** - Environment setup and configuration

### Core Concepts
- **[Architecture Overview](./architecture.md)** - Understanding the bot's architecture
- **[Dependency Injection](./architecture.md#dependency-injection)** - How DI works in this template
- **[Decorators](./architecture.md#decorators)** - Using decorators for commands and events
- **[Module System](./architecture.md#module-system)** - Creating and organizing modules

### Development Guides
- **[Creating Commands](./guides/creating-commands.md)** - Build custom slash commands
- **[Creating Events](./guides/creating-events.md)** - Handle Discord events
- **[Creating Modules](./guides/creating-modules.md)** - Organize features into modules
- **[Middleware](./guides/middleware.md)** - Using and creating middleware
- **[Database Integration](./guides/database.md)** - Working with Prisma and PostgreSQL
- **[Error Handling](./guides/error-handling.md)** - Proper error handling patterns

### API Reference
- **[ExtendedClient](./api/extended-client.md)** - The main bot client
- **[BaseCommand](./api/base-command.md)** - Command base class
- **[BaseEvent](./api/base-event.md)** - Event base class
- **[BaseModule](./api/base-module.md)** - Module base class
- **[Decorators API](./api/decorators.md)** - All available decorators
- **[Builders](./api/builders.md)** - Embed and component builders
- **[Logger](./api/logger.md)** - Logging system
- **[Config](./api/config.md)** - Configuration management

### Deployment & Production
- **[Deployment Guide](./deployment.md)** - Deploy your bot to production
- **[Docker Deployment](./deployment.md#docker)** - Using Docker and Docker Compose
- **[Monitoring](./deployment.md#monitoring)** - Health checks and metrics
- **[CI/CD](./deployment.md#cicd)** - Automated testing and deployment

### Additional Resources
- **[Testing Guide](./testing.md)** - Writing and running tests
- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions
- **[Best Practices](./best-practices.md)** - Code quality and patterns
- **[Examples](./examples/)** - Code examples and use cases
- **[FAQ](./faq.md)** - Frequently asked questions

## 🚀 Quick Links

### For Beginners
1. Start with the [Quick Start Guide](./getting-started.md)
2. Learn about [Creating Commands](./guides/creating-commands.md)
3. Understand [Decorators](./architecture.md#decorators)
4. Explore the [Examples](./examples/)

### For Advanced Users
1. Deep dive into [Architecture](./architecture.md)
2. Learn about [Dependency Injection](./architecture.md#dependency-injection)
3. Create custom [Middleware](./guides/middleware.md)
4. Set up [Database Integration](./guides/database.md)
5. Configure [Monitoring](./deployment.md#monitoring)

## 📖 What's New in v2.0

This template has been completely rewritten from the ground up with modern patterns:

- **Decorator-Based Architecture** - Use `@Command`, `@Event`, and other decorators
- **Dependency Injection** - Built-in DI container with tsyringe
- **Modular Design** - Organize features into self-contained modules
- **Type Safety** - Full TypeScript with strict mode
- **Database Integration** - Prisma ORM with migrations
- **Monitoring** - Health checks, metrics, and logging
- **Testing** - Comprehensive test suite with Jest
- **Production Ready** - Docker support, CI/CD pipelines

## 🤔 Need Help?

- **Issues**: [GitHub Issues](https://github.com/0xXrer/Discord-bot-Template/issues)
- **Discord API**: [Oceanic.js Documentation](https://docs.oceanic.ws/)
- **TypeScript**: [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 📝 Contributing to Documentation

Found an error or want to improve the docs? Contributions are welcome!

1. Fork the repository
2. Make your changes in the `docs/` directory
3. Submit a pull request

---

**Version**: 2.0.0
**Last Updated**: November 2025
**Maintained by**: [0xXrer](https://github.com/0xXrer)
