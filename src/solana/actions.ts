import { Connection, VersionedTransaction, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {getAccount, getAssociatedTokenAddress, getMint} from "@solana/spl-token"
import bs58 from "bs58";
import { logToFile } from '../utils/logger';
import fetch from 'node-fetch';  // Подключаем fetch

const RPC_ENDPOINT = "https://proud-wider-mound.solana-mainnet.quiknode.pro/2a32ab5b5b591114ea720bd403447b2a80d58436/";
const PUMPFUN_URL = 'https://pumpportal.fun/api/trade-local';
const TOKEN_ADRESS = 'CAFHsPLcmY4w8MtL1qT94pb5NHB6E1kgNEVKxbm1pump';
const POOL = "pump";//"pump", "raydium", "pump-amm" or "auto"

const web3Connection = new Connection(
    RPC_ENDPOINT,
    'confirmed',
);

export async function buyToken(privateKey: string, publicKey: string, amount: number, isSol: boolean) {
    const response = await fetch(PUMPFUN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            publicKey,
            action: "buy",
            mint: TOKEN_ADRESS,
            denominatedInSol: isSol.toString(),
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

export async function checkBalance(privateKey: string) {
    try {
        const wallet = await Keypair.fromSecretKey(bs58.decode(privateKey));
        const balanceSol = await web3Connection.getBalance(new PublicKey(wallet.publicKey));

        const tokenAddress = new PublicKey(TOKEN_ADRESS);
        const ata = await getAssociatedTokenAddress(tokenAddress, wallet.publicKey);
        const accountInfo = await getAccount(web3Connection, ata);
        const mintInfo = await getMint(web3Connection, tokenAddress);
        const decimals = mintInfo.decimals;
        const balanceSpl = Number(accountInfo.amount) / (10 ** decimals);
        console.log(`Wallet ${wallet.publicKey}\tSOL balance: ${(balanceSol) / LAMPORTS_PER_SOL} SOL\tSPL balance: ${balanceSpl}`);
    } catch (error) {
        console.log(error);
    }
}

export async function sellByPercentage(percent: number, privateKey: string, publicKey: string) {
    try {
        const wallet = Keypair.fromSecretKey(bs58.decode(privateKey));
        const tokenAddress = new PublicKey(TOKEN_ADRESS);
        const ata = await getAssociatedTokenAddress(tokenAddress, wallet.publicKey);
        const accountInfo = await getAccount(web3Connection, ata);
        const mintInfo = await getMint(web3Connection, tokenAddress);
        const decimals = mintInfo.decimals;
        const balanceSpl = Number(accountInfo.amount) / (10 ** decimals);
        const finalAmountToSell = Math.floor(balanceSpl * (percent/100));

        if (finalAmountToSell <= 0) {
            console.log(`Недостаточно токенов для продажи ${percent}% — рассчитано к продаже: ${finalAmountToSell}`);
            return;
        }

        await sellToken(privateKey, publicKey, finalAmountToSell);
    } catch (error) {
        console.log(error);
    }
}

export async function buyByPercentage(percent: number , privateKey: string, publicKey: string) {
    try {
        const wallet = Keypair.fromSecretKey(bs58.decode(privateKey));
        const tokenAddress = new PublicKey(TOKEN_ADRESS);
        const ata = await getAssociatedTokenAddress(tokenAddress, wallet.publicKey);
        const accountInfo = await getAccount(web3Connection, ata);
        const mintInfo = await getMint(web3Connection, tokenAddress);
        const decimals = mintInfo.decimals;
        const balanceSpl = Number(accountInfo.amount) / (10 ** decimals);
        console.log(balanceSpl);
        const finalAmountToBuy = Math.floor(balanceSpl * (percent/100));

        if (finalAmountToBuy <= 0) {
            console.log(`Недостаточно токенов для покупки ${percent}% — рассчитано к покупке: ${finalAmountToBuy}`);
            return;
        }

        await buyToken(privateKey, publicKey,finalAmountToBuy, false)
    } catch (error) {
        console.log(error);
    }
}




