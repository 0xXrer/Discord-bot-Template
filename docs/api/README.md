# API Reference

This section contains detailed API documentation for all classes and methods in the BOTMINE Discord bot.

## Table of Contents

- [BotClient](./BotClient.md) - Main bot client class
- [BaseCommand](./BaseCommand.md) - Base class for commands
- [BaseEvent](./BaseEvent.md) - Base class for events
- [CommandHandler](./CommandHandler.md) - Command management
- [EventHandler](./EventHandler.md) - Event management
- [PermissionManager](./PermissionManager.md) - Permission system
- [Logger](./Logger.md) - Logging system
- [FileUtils](./FileUtils.md) - File utilities
- [Config](./Config.md) - Configuration management

## Core Classes

### BotClient

The main bot client that extends Oceanic.js Client with additional functionality.

**Key Features:**
- Command and event handling
- Permission management
- Global command registration
- Graceful shutdown

### BaseCommand

Abstract base class for all slash commands.

**Key Features:**
- Permission checking
- Context validation (guild/DM)
- Cooldown support
- User installable support

### BaseEvent

Abstract base class for all Discord events.

**Key Features:**
- Event registration
- Once/on execution modes
- Error handling

## Handlers

### CommandHandler

Manages command loading, execution, and registration.

**Features:**
- Dynamic command loading
- Command reloading
- Global command registration

### EventHandler

Manages event loading and registration.

**Features:**
- Dynamic event loading
- Event listener registration
- Error handling

## Managers

### PermissionManager

Handles user permissions and access control.

**Features:**
- Permission levels
- Guild-specific permissions
- Owner permissions

## Utilities

### Logger

Provides structured logging with different levels.

**Features:**
- Multiple log levels
- Timestamp formatting
- Object serialization

### FileUtils

Utility functions for file operations.

**Features:**
- Directory traversal
- JSON file operations
- File existence checking

### Config

Manages environment configuration and validation.

**Features:**
- Environment variable loading
- Configuration validation
- Development/production modes
