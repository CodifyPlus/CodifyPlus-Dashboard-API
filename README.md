## StartupKro Dashboard API

This is the API for the StartupKro Dashboard. It is a RESTful API built with Node.js, Express, and MongoDB. 

- Looking to contribute in any way? Check out the [Contributing Guidelines](./CONTRIBUTING.md)
- Facing a problem? Check out the [Issues Page]()

### How to setup locally?

- Clone the repository
- Run `npm install` to install all the dependencies
- Run `npm run serve` to start the server. We recomment using [nodemon](https://www.npmjs.com/package/nodemon) for development.
- The server will be running on `localhost:8080`

Obtain the following keys and add them to a `.env` file in the root directory of the project. Checkout the `.env.sample` file for reference.

- `SECRET`: A random string used for signing JWT tokens
- `DB_URL`: The URL of the MongoDB database. (Usually `mongodb://localhost:27017/startupkro_dashboard`)
- `NOVU_API_KEY`: The API key for the Novu API. Obtain from [Novu](https://novu.co/)
- `CORS_URL`: The URL of the frontend application. (Usually `http://localhost:3000`)
- If you want to test email functionality, add the following keys as well:
  - `SMTP_HOST`: The SMTP host for sending emails
  - `SMTP_USER`: The SMTP user for sending emails
  - `SMTP_PASS`: The SMTP password for sending emails
- If you want to test Telegram API, add the following keys as well.
  - `TELEGRAM_BOT_TOKEN`: The Telegram bot token. Obtain from [BotFather](https://t.me/BotFather)
  - `CHAT_ID`: The Telegram chat ID. Obtain from [IDBot](https://t.me/myidbot)