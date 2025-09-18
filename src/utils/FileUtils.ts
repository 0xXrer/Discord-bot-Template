import fs from 'fs/promises';
import path from 'path';

export class FileUtils {
    public static async getFiles(directory: string, extension: string = ''): Promise<string[]> {
        try {
            const files: string[] = [];
            
            // Check if directory exists
            try {
                await fs.access(directory);
            } catch {
                return files;
            }

            const items = await fs.readdir(directory, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(directory, item.name);
                
                if (item.isDirectory()) {
                    // Recursively get files from subdirectories
                    const subFiles = await this.getFiles(fullPath, extension);
                    files.push(...subFiles);
                } else if (item.isFile()) {
                    // Add file if it matches the extension filter
                    if (!extension || item.name.endsWith(extension)) {
                        files.push(fullPath);
                    }
                }
            }
            
            return files;
        } catch (error) {
            throw new Error(`Failed to read directory ${directory}: ${error}`);
        }
    }

    public static async ensureDirectory(directory: string): Promise<void> {
        try {
            await fs.mkdir(directory, { recursive: true });
        } catch (error) {
            throw new Error(`Failed to create directory ${directory}: ${error}`);
        }
    }

    public static async fileExists(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    public static async readJsonFile<T>(filePath: string): Promise<T> {
        try {
            const data = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(data) as T;
        } catch (error) {
            throw new Error(`Failed to read JSON file ${filePath}: ${error}`);
        }
    }

    public static async writeJsonFile<T>(filePath: string, data: T): Promise<void> {
        try {
            const directory = path.dirname(filePath);
            await this.ensureDirectory(directory);
            await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
        } catch (error) {
            throw new Error(`Failed to write JSON file ${filePath}: ${error}`);
        }
    }
}