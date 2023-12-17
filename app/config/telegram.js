const fetch = require('node-fetch');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

async function sendTelegramMessage(message) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const data = {
        chat_id: CHAT_ID,
        text: message,
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        // console.log(result);
    } catch (error) {
        console.error('Error sending Telegram message:', error);
    }
}

module.exports = {
    sendTelegramMessage,
};
