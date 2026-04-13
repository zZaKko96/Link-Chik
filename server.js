const express = require('express');
const setupDB = require('./database');

const app = express();
const PORT = 3000;

app.use(express.static('.'));
app.use(express.json()); // Щоб сервер розумів формат JSON від клієнта

setupDB().then((db) => {
    app.locals.db = db;

    // ==========================================
    // 🚦 API МАРШРУТИ (ROUTES)
    // ==========================================

    // 1. Реєстрація користувача (POST запит)
    app.post('/api/register', async (req, res) => {
        const { name, email, password, gender, date } = req.body;
        const regDate = new Date().toLocaleDateString('uk-UA');
        
        try {
            // Намагаємося додати юзера в базу
            const result = await db.run(
                `INSERT INTO users (name, email, password, gender, date, regDate, phone, photo) 
                 VALUES (?, ?, ?, ?, ?, ?, '', '')`,
                [name, email, password, gender, date, regDate]
            );
            res.json({ success: true, userId: result.lastID });
        } catch (error) {
            // Якщо email вже є в базі, SQLite видасть помилку (через UNIQUE)
            if (error.message.includes('UNIQUE constraint failed')) {
                res.status(400).json({ success: false, message: "Користувач з таким email вже існує!" });
            } else {
                res.status(500).json({ success: false, message: "Помилка сервера" });
            }
        }
    });

    // 2. Логін користувача (POST запит)
    app.post('/api/login', async (req, res) => {
        const { email, password } = req.body;
        // Шукаємо юзера в базі
        const user = await db.get(`SELECT * FROM users WHERE email = ? AND password = ?`, [email, password]);
        
        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(401).json({ success: false, message: "Невірний email або пароль!" });
        }
    });

    // 3. Отримання всіх посилань конкретного користувача (GET запит)
    app.get('/api/links/:userId', async (req, res) => {
        const userId = req.params.userId;
        const links = await db.all(`SELECT * FROM links WHERE userId = ?`, [userId]);
        res.json(links);
    });

    // 4. Додавання нового посилання (POST запит)
    app.post('/api/links', async (req, res) => {
        const { userId, originalUrl } = req.body;
        
        try {
            // Звертаємося до зовнішнього API для генерації короткого лінка (як ти робив раніше)
            const response = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(originalUrl)}`);
            const data = await response.json();
            const shortUrl = data.shorturl || 'Помилка API';

            // Зберігаємо в нашу базу
            const result = await db.run(
                `INSERT INTO links (userId, originalUrl, shortUrl, clicks) VALUES (?, ?, ?, 0)`,
                [userId, originalUrl, shortUrl]
            );
            
            res.json({ success: true, link: { id: result.lastID, userId, originalUrl, shortUrl, clicks: 0 } });
        } catch (error) {
            res.status(500).json({ success: false, message: "Помилка при створенні посилання" });
        }
    });

    // 5. Видалення посилання (DELETE запит)
    app.delete('/api/links/:id', async (req, res) => {
        await db.run(`DELETE FROM links WHERE id = ?`, [req.params.id]);
        res.json({ success: true });
    });

    // 6. Оновлення даних користувача (PUT запит)
    app.put('/api/users/:id', async (req, res) => {
        const { name, email, phone, gender, date, photo } = req.body;
        try {
            await db.run(
                `UPDATE users SET name = ?, email = ?, phone = ?, gender = ?, date = ?, photo = ? WHERE id = ?`,
                [name, email, phone, gender, date, photo, req.params.id]
            );
            // Отримуємо оновленого юзера, щоб повернути його на фронтенд
            const updatedUser = await db.get(`SELECT * FROM users WHERE id = ?`, [req.params.id]);
            res.json({ success: true, user: updatedUser });
        } catch (error) {
            res.status(500).json({ success: false, message: "Помилка оновлення" });
        }
    });

    // 7. Видалення акаунту користувача (DELETE запит)
    app.delete('/api/users/:id', async (req, res) => {
        await db.run(`DELETE FROM users WHERE id = ?`, [req.params.id]);
        res.json({ success: true });
    });
	
	// 8. Оновлення лічильника кліків (PATCH запит)
    app.patch('/api/links/:id/click', async (req, res) => {
        try {
            // Збільшуємо кліки на 1 для конкретного посилання
            await db.run(
                `UPDATE links SET clicks = clicks + 1 WHERE id = ?`,
                [req.params.id]
            );
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: "Помилка оновлення кліків" });
        }
    });

    app.listen(PORT, () => {
        console.log(`🚀 Сервер працює на http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error("❌ Помилка запуску бази даних:", err);
});