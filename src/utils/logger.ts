import { appendFile } from 'fs/promises';

export async function logToFile(message: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    try {
      await appendFile('logs.txt', logMessage, 'utf8');
    } catch (err) {
      console.error('Ошибка записи в лог файл:', err);
    }
  }