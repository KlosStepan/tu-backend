import { promises as fs } from 'fs';
import * as path from 'path';

// TODO - database integration 
export async function accounts(): Promise<unknown> {
    const data = await fs.readFile(path.resolve(__dirname, "./ta-accounts-response.json"), 'utf8');
    const jsonData = JSON.parse(data);
    return jsonData;
}

export async function balance(accountNumber: number): Promise<unknown> {
    //TODO - separate as proper function w/ proper handling accomodating DB calls (mby w/ some ORM middleware)
    return (async () => {
        switch (accountNumber) {
            case 2002222222: {
                try {
                    const data = await fs.readFile(path.resolve(__dirname, "./ta-2002222222-balance-response.json"), 'utf8');
                    return JSON.parse(data);
                } catch (error) {
                    throw new Error(`Error reading file: ${error.message}`);
                }
            }
            default:
                return { error: `Client #${accountNumber} doesn't have account in this bank!` };
        }
    })();
}


export async function transactions(accountNumber: number): Promise<unknown> {
    //TODO - separate as proper function w/ proper handling accomodating DB calls (mby w/ some ORM middleware)
    return (async () => {
        switch (accountNumber) {
            case 2002222222: {
                try {
                    const data = await fs.readFile(path.resolve(__dirname, "./ta-2002222222-transactions-response.json"), 'utf8');
                    return JSON.parse(data);
                } catch (error) {
                    throw new Error(`Error reading file: ${error.message}`);
                }
            }
            default:
                return { error: `Client #${accountNumber} doesn't have account in this bank!` };
        }
    })();
}