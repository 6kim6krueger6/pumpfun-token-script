import {buyToken, sellToken, checkBalance, sellByPercentage} from  "./solana/actions"
import { parseCSV } from "./utils/csvparser";
import Wallet from "./types/wallet";
import { select, input , confirm} from '@inquirer/prompts';
import path from 'path';



async function execute() {
    console.log('=== Solana Pumpfun CLI ===');


    const walletsPath = path.resolve('wallets.csv');
    const wallets = await parseCSV(walletsPath);

    if (wallets.length === 0) {
        console.error('Ошибка: Файл wallets.csv пуст или не найден кошелек.');
        process.exit(1);
    }

    const action = await select({
        message: 'Купить или продать токен?',
        choices: [
            { name: 'Купить', value: 'buy' },
            { name: 'Продать', value: 'sell' },
            { name: 'Посмотреть баланс', value: 'balances'}
        ],
    });

    const walletChoice = await select({
        message: 'Выберите кошелек(и)',
        choices: [
            { name: 'Один кошелек (по индексу)', value: 'one' },
            { name: 'Все кошельки', value: 'all' },
            { name: 'Несколько кошельков (индексы через запятую)', value: 'multiple' },
        ],
    });

    let selectedWallets: Wallet[] = [];

    let sellByPercent;
    let percent;

    if (walletChoice === 'one') {
        const indexInput = await input({ message: 'Введите индекс кошелька:' });
        const index = Number(indexInput.trim());
        const wallet = wallets.find(w => w.index === index);
        if (!wallet) {
            console.error(`Ошибка: Кошелек с индексом ${index} не найден.`);
            process.exit(1);
        }
        if (action === 'sell') {
            const sellByPercent = await confirm({ message: 'Продать по процентам?'});
            if (sellByPercent) {
                const percent = await input({ message: 'Введите процент токенов для ародажи (%):' });
                await sellByPercentage(Number(percent),wallet.privateKey, wallet.publicKey);
                process.exit(1);  
            }
        }
        selectedWallets = [wallet];
    }

    if (walletChoice === 'multiple') {
        const indicesInput = await input({ message: 'Введите индексы кошельков через запятую:' });
        const indices = indicesInput
            .split(',')
            .map(i => Number(i.trim()))
            .filter(n => !isNaN(n));

        selectedWallets = wallets.filter(w => indices.includes(w.index));

        if (selectedWallets.length === 0) {
            console.error('Ошибка: Ни один из указанных индексов не найден.');
            process.exit(1);
        }
    }

    if (walletChoice === 'all') {
        selectedWallets = wallets;
    }

    if(action === 'balances'){
        for(const wallet of selectedWallets){
            await checkBalance(wallet.privateKey);
        }
        process.exit(1);
    }

    const amountInput = await input({ message: 'Введите сумму (amount):' });
    const amount = Number(amountInput.trim());
    if (isNaN(amount) || amount <= 0) {
        console.error('Ошибка: Некорректная сумма.');
        process.exit(1);
    }

    console.log('\n=== РЕЗЮМЕ ===');
    console.log(`Вы выбрали действие: ${action === 'buy' ? 'Купить' : 'Продать'}`);
    console.log(`Индексы выбранных кошельков: ${selectedWallets.map(w => w.index).join(', ')}`);
    console.log(`Сумма: ${amount}`);


    for (const wallet of selectedWallets) {
        if (action === 'buy') {
            await buyToken(wallet.privateKey, wallet.publicKey, amount);
        } else {
            await sellToken(wallet.privateKey, wallet.publicKey, amount);
        }
    }

    console.log('\n✅ Все операции завершены.');
}

execute();


