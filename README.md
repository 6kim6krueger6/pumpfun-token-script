## 🚀 Установка окружения

- Node.js (v16 or higher)
- npm or yarn
- Solana CLI (optional)

1. Скачать Node.js(если нет)
   ```bash
   brew install node
   ```
2. Клонирование проекта:
    ```bash
    git clone https://github.com/6kim6krueger6/pumpfun-token-script.git
    cd pumpfun-token-script
    ```
3. Установка зависимостей:
    ```bash
    npm install
    ```

### Подготовка проекта
1. Добавить кошельки в wallets.csv файл в формате:
    ```
    порядковый номер,публичный ключ,приватный ключ
    ```
2. Добавить адрес токена для работы в модуле ```src/solana/actions.ts``` на строке 8:
    ```typescript
    const TOKEN_ADRESS = '4y9E3tJpGNzRr1592oWTPECgyp2VDSc1Bf3DqAm5FZsK';
    ```

### Запуск проекта

1. Скомпилировать проект:
```bash
npm run build
```
2. Запустить проект:
```bash
npm run serve
```

### 📝 Результат транзакций
1. Логи сохраняются в файл logs.txt
2. Ссылка на SOL scan появляется в командной строке
