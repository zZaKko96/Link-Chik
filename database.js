const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

// Асинхронна функція для ініціалізації бази даних
async function setupDB() {
    // Відкриваємо з'єднання (файл database.db створиться автоматично)
    const db = await open({
        filename: './database.db',
        driver: sqlite3.Database
    });

    // Створюємо таблицю користувачів (якщо її ще немає)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            gender TEXT,
            date TEXT,
            regDate TEXT,
            phone TEXT,
            photo TEXT
        )
    `);

    // Створюємо таблицю посилань
    await db.exec(`
        CREATE TABLE IF NOT EXISTS links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            originalUrl TEXT,
            shortUrl TEXT,
            clicks INTEGER DEFAULT 0,
            FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    console.log("✅ База даних SQLite успішно ініціалізована!");
    return db; // Повертаємо об'єкт бази, щоб сервер міг з нею працювати
}

module.exports = setupDB;