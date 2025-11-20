# Changelog

All notable changes to `create-discord-bot-oceanic` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-11-20

### Added

- Complete CLI rewrite with modern architecture
- Interactive prompts for project configuration
- Support for multiple package managers (npm, pnpm, yarn, bun)
- Database selection (Prisma with PostgreSQL/MySQL/SQLite, Supabase, or none)
- Automatic Docker configuration
- Module selection system (choose which features to include)
- Auto-detection of preferred package manager
- Git repository initialization
- Automatic dependency installation
- Prisma client generation
- Command-line options for non-interactive mode (`-y, --yes`)
- Beautiful CLI output with colors and spinners
- Comprehensive error handling
- Step-by-step progress indicators

### Database Options

- **Prisma** with PostgreSQL - Full ORM setup with migrations
- **Prisma** with MySQL - MySQL database support
- **Prisma** with SQLite - Lightweight local database
- **Supabase** - Backend-as-a-Service with example migrations
- **None** - No database, minimal setup

### Features

- Decorator-based command system
- Dependency injection with tsyringe
- Module-based architecture
- TypeScript with strict mode
- Winston logging
- Health check endpoints
- Prometheus metrics
- Docker and docker-compose support
- ESLint and Prettier configuration
- Jest testing setup

### Templates

- Automatic `.env` file generation
- Custom `.gitignore` creation
- `package.json` customization based on selections
- Docker compose configuration for selected database
- Supabase migration templates
- Prisma schema templates for different databases

### Developer Experience

- Detailed next steps after project creation
- Helpful documentation links
- Validation for project names
- Directory existence checking
- Clean error messages

## [1.0.0] - 2024-11-19

### Added

- Initial CLI release
- Basic template cloning
- Simple project scaffolding

---

## Upcoming Features

### [2.1.0] - Planned

- [ ] More module options (economy, leveling, music)
- [ ] Redis configuration option
- [ ] GitHub Actions workflow templates
- [ ] Custom command templates
- [ ] Interactive module creator
- [ ] Project update command
- [ ] Migration from v1.x guide

### Future Considerations

- GraphQL API option
- REST API scaffolding
- Multi-bot workspace support
- Plugin system
- Web dashboard template
- Kubernetes deployment configs
- Cloud deployment guides (Railway, Heroku, AWS)
