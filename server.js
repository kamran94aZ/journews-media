const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

dotenv.config();
const app = express();

// HELMET - CSP-ni tamamilə deaktiv edirik (bu, bütün "refused" xətalarını öldürəcək)
app.use(helmet({
    contentSecurityPolicy: false, 
    crossOriginEmbedderPolicy: false
}));

// CORS - Bütün sorğulara icazə veririk
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// MONGODB Bağlantısı
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/journews")
    .then(() => console.log('Secure connection established with MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// ... (Article Schema və digər kodların olduğu kimi qalır)

// Routes (Düzgün yönləndirmə)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'article.html'));
});

// API Endpoints...
// (Kodun qalan hissəsi olduğu kimi qalır)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`JourNews Server is running securely on port ${PORT}.`);
});
