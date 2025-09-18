import dotenv from 'dotenv';
import { BotClient } from './client/BotClient';
import { Logger } from './utils/Logger';

// Load environment variables
dotenv.config();

const logger = new Logger('Init');

async function main() {
    try {
        // Validate required environment variables
        if (!process.env.BOT_TOKEN) {
            throw new Error('BOT_TOKEN is required in .env file');
        }

        if (!process.env.CLIENT_ID) {
            throw new Error('CLIENT_ID is required in .env file');
        }

        // Initialize bot client
        const client = new BotClient({
            auth: `Bot ${process.env.BOT_TOKEN}`,
            gateway: {
                intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"],
            },
        });

        // Start the bot
        await client.initialize();

        // Graceful shutdown handling
        process.on('SIGINT', async () => {
            logger.info('Received SIGINT, shutting down gracefully...');
            await client.shutdown();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            logger.info('Received SIGTERM, shutting down gracefully...');
            await client.shutdown();
            process.exit(0);
        });

    } catch (error) {
        logger.error('Failed to start bot:', error);
        process.exit(1);
    }
}

// Handle unhandled rejections and exceptions
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

main();