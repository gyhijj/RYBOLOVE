require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const User = require('./models/User'); 
const fs = require('fs');
const reviewsFile = 'reviews.json';
const Joi = require("joi");
const Order = require('./models/Order');

// Настройка CORS
const allowedOrigins = [
  'https://rybolove.onrender.com', // Первый сайт
];

console.log("Отправка запроса на /refresh");

const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            "https://rybolove.onrender.com",
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true, // Обязательно для передачи s!
};
app.use(express.json());
app.use(cors(corsOptions));
// Используем CORS с настройками
app.use(cors(corsOptions));
app.use(cookieParser());
// Подключение к MongoDB

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: false
})
.then(() => console.log("✅ MongoDB connected по URI из .env"))
.catch((error) => console.error("❌ MongoDB connection error:", error));


mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: false, // Включено SSL
})
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Middleware для обработки JSON

// Функция проверки срока жизни токена
function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1])); // Декодируем токен
        return payload.exp * 1000 < Date.now(); // Если exp в прошлом — токен истёк
    } catch (e) {
        return true; // Если ошибка — токен недействителен
    }
}


// Перенаправление HTTP на HTTPS
app.use((req, res, next) => {
    if (process.env.NODE_ENV === "production") {
        console.log("Проверка протокола:", req.headers["x-forwarded-proto"]);
        if (req.headers["x-forwarded-proto"] !== "https") {
            console.log("🔄 Перенаправление на HTTPS...");
            return res.redirect(`https://${req.headers.host}${req.url}`);
        }
    }
    next();
});



// Указание папки со статическими файлами
app.use(express.static(path.join(__dirname, "public")));


function generateTokens(user, site) {
    const issuedAt = Math.floor(Date.now() / 1000);
    
    const accessToken = jwt.sign(
        { id: user._id, username: user.username, site: "https://rybolove.onrender.com", iat: issuedAt },
        JWT_SECRET,
        { expiresIn: "30m" }  // ⏳ Access-токен на 30 минут
    );

    const refreshToken = jwt.sign(
        { id: user._id, username: user.username, site: "https://rybolove.onrender.com", iat: issuedAt },
        REFRESH_SECRET,
        { expiresIn: "7d" }  // 🔄 Refresh-токен на 7 дней
    );

    return { accessToken, refreshToken };
}




// Регистрация пользователя
app.post('/register', async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().trim().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
    email: Joi.string().email().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { username, password, email } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Пользователь с таким именем уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();
    console.log(`✅ Пользователь "${username}" зарегистрирован.`);
    return res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });

  } catch (err) {
    console.error("Ошибка регистрации:", err);
    return res.status(500).json({ message: 'Ошибка регистрации пользователя', error: err.message });
  }
});
// Авторизация пользователя
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Ищем пользователя по email, а не username
    const user = await User.findOne({ email: username });

    if (!user) {
      return res.status(401).json({ message: 'Пользователь с таким email не найден' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Неверный пароль' });
    }

    res.status(200).json({
      message: 'Вход выполнен',
      userId: user._id
    });

  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ message: 'Ошибка сервера при входе' });
  }
});



// Обработка запроса на обновление токена для ПК-версии
app.post('/refresh', async (req, res) => {
    const refreshToken = req.cookies.refreshTokenDesktop;

    if (!refreshToken) {
        console.error("❌ Refresh-токен отсутствует в cookies");
        return res.status(401).json({ message: "Не авторизован" });
    }

    console.log("🔍 Полученный refreshToken:", refreshToken);
    
    jwt.verify(refreshToken, REFRESH_SECRET, async (err, decoded) => {
        if (err) {
            console.error("❌ Ошибка проверки refresh-токена:", err.message);
            
            res.clearCookie("refreshTokenDesktop", {
                httpOnly: true,
                secure: true,
                sameSite: "None",
                path: "/"
            });

            return res.status(403).json({ message: "Refresh-токен недействителен или истёк" });
        }

        if (!decoded.exp || (decoded.exp * 1000 < Date.now())) {
            console.error("❌ Refresh-токен окончательно истёк!");
            res.clearCookie("refreshTokenDesktop", { path: "/" });
            return res.status(403).json({ message: "Refresh-токен истёк" });
        }

        try {
            const user = await User.findById(decoded.id);
            if (!user) {
                console.error("❌ Пользователь не найден по ID:", decoded.id);
                return res.status(404).json({ message: "Пользователь не найден" });
            }

            const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
            res.setHeader("Access-Control-Allow-Credentials", "true"); // ✅ Добавили заголовок
            res.cookie("refreshTokenDesktop", newRefreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "None",
                path: "/",
                maxAge: 30 * 24 * 60 * 60 * 1000  // 30 дней
            });

            console.log("✅ Refresh-токен обновлён успешно");

            // 🚀 Отключаем кеширование
            res.setHeader("Access-Control-Allow-Credentials", "true"); // ✅ Добавили заголовок
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");

            res.json({ accessToken });

        } catch (error) {
            console.error("❌ Ошибка при поиске пользователя:", error);
            return res.status(500).json({ message: "Ошибка сервера" });
        }
    });
});


app.post('/logout', (req, res) => {
    console.log("🔄 Выход из аккаунта...");
    
    res.clearCookie("refreshTokenDesktop", {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        path: "/",
        domain: "https://rybolove.onrender.com"
    });

    res.json({ message: 'Вы вышли из системы' });
});


// Обновление токена
app.post('/-token', (req, res) => {
  const { token: Token } = req.body;

  if (!Token) {
    return res.status(403).json({ message: 'Токен обновления не предоставлен' });
  }

  try {
    const user = jwt.verify(Token, JWT_SECRET);
    const newAccessToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: 'Недействительный токен обновления' });
  }
});

// Обработка корневого маршрута
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Проверка соединения
app.get("/connect", (req, res) => {
  res.send("Соединение с сервером успешно!");
});

// Обработчик ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Что-то пошло не так!', error: err.message });
});

// Обработка 404 ошибок
app.use((req, res) => {
  res.status(404).json({ message: "Ресурс не найден" });
});

// Порт, на котором будет работать сервер
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
});


app.post('/order', async (req, res) => {
  try {
    const { userId, items, total } = req.body;

    const newOrder = new Order({ userId, items, total });
    await newOrder.save();

    res.status(201).json({ message: "Заказ успешно оформлен" });
  } catch (err) {
    console.error("Ошибка при создании заказа:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.get('/orders/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Ошибка при получении заказов:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});
async function loadOrders(userId) {
  const res = await fetch(`${userId}`);
  const orders = await res.json();
  // отображаем в модальном окне или отдельной секции
}
app.get('/orders/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Ошибка при получении истории заказов:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});
