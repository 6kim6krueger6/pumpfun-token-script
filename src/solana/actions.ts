import { Connection, VersionedTransaction, Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { logToFile } from '../utils/logger';

const RPC_ENDPOINT = "https://proud-wider-mound.solana-mainnet.quiknode.pro/2a32ab5b5b591114ea720bd403447b2a80d58436/";
const PUMPFUN_URL = 'https://pumpportal.fun/api/trade-local';
const TOKEN_ADRESS = '5LJMJyR8MtAkbtpf8kFUV7S9oFG3xaGDdcnFxYt9pump';
const POOL = "raydium";//"pump", "raydium", "pump-amm" or "auto"

const web3Connection = new Connection(
    RPC_ENDPOINT,
    'confirmed',
);

export async function buyToken(privateKey: string, publicKey: string, amount: number) {
    const response = await fetch(PUMPFUN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            publicKey,
            action: "buy",
            mint: TOKEN_ADRESS,
            denominatedInSol: "true",
            amount,
            slippage: 10,
            priorityFee: 0.00001,
            pool: POOL
        })
    });

    if (response.status === 200) {
        const data = await response.arrayBuffer();
        const tx = VersionedTransaction.deserialize(new Uint8Array(data));
        const signerKeyPair = Keypair.fromSecretKey(bs58.decode(privateKey));
        tx.sign([signerKeyPair]);
        const signature = await web3Connection.sendTransaction(tx);
        const txUrl = "https://solscan.io/tx/" + signature;
        console.log("Transaction:", txUrl);
        await logToFile(`BUY | Wallet: ${publicKey} | Amount: ${amount} | TX: ${txUrl}`);
    } else {
        console.log(response.statusText);
        await logToFile(`BUY ERROR | Wallet: ${publicKey} | Amount: ${amount} | Error: ${response.statusText}`);
    }
}

export async function sellToken(privateKey: string, publicKey: string, amount: number) {
    const response = await fetch(PUMPFUN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            publicKey,
            action: "sell",
            mint: TOKEN_ADRESS,
            denominatedInSol: "false",
            amount,
            slippage: 10,
            priorityFee: 0.00001,
            pool: POOL
        })
    });

    if (response.status === 200) {
        const data = await response.arrayBuffer();
        const tx = VersionedTransaction.deserialize(new Uint8Array(data));
        const signerKeyPair = Keypair.fromSecretKey(bs58.decode(privateKey));
        tx.sign([signerKeyPair]);
        const signature = await web3Connection.sendTransaction(tx);
        const txUrl = "https://solscan.io/tx/" + signature;
        console.log("Transaction:", txUrl);
        await logToFile(`SELL | Wallet: ${publicKey} | Amount: ${amount} | TX: ${txUrl}`);
    } else {
        console.log(response.statusText);
        await logToFile(`SELL ERROR | Wallet: ${publicKey} | Amount: ${amount} | Error: ${response.statusText}`);
    }
}



