import { readFileSync } from 'fs';
import { parse } from 'csv-parse';
import Wallet from '../types/wallet';

export async function parseCSV(filePath: string): Promise<Wallet[]> {
    const content = readFileSync(filePath, 'utf-8');
    
    return new Promise((resolve, reject) => {
        parse(content, {
            columns: ['index', 'publicKey', 'privateKey'],
            cast: (value, context) => 
                context.column === 'index' ? Number(value) : value,
            skip_empty_lines: true,
            trim: true
        }, (err, records: Wallet[]) => {
            if (err) reject(err);
            else resolve(records);
        });
    });
}