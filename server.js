const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

dotenv.config();
const app = express();

app.use(helmet({
    contentSecurityPolicy: false, 
    crossOriginEmbedderPolicy: false
}));

app.use(cors({
    origin: 'https://kamran94az.github.io', 
    methods: ['GET', 'POST', 'PUT'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '10kb'}));
app.use(express.urlencoded({ extended: true, limit: '10kb'}));

app.use(express.static(path.join(__dirname, 'public')));

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Article title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters!']
    },
    content: {
        type: String,
        required: [true, 'Article content is required'],
        trim: true
    },
    category: {
        type: String,
        default: 'General',
        trim: true
    },
    link: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Article = mongoose.model('Article', articleSchema, 'articles');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'article.html'));
});

app.get('/api/articles', async (req, res) => {
    try {
        const articles = await Article.find().sort({ createdAt: -1 });
        res.status(200).json({
            status: 'success',
            results: articles.length,
            data: articles
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch articles'});
    }
});

app.post('/api/articles', mongoSanitize({ replaceWith: '_' }), async (req, res) => {
    try {
        let {title, content, category, link} = req.body;
        if (!title || !content) {
            return res.status(400).json({ status: 'error', message: 'Title and content are required fields!'});
        }

        title = title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        content = content.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        const newArticle = await Article.create({
            title,
            content,
            category,
            link
        });
        console.log(`New article saved to database: ${newArticle.title}`);

        res.status(201).json({
            status: 'success',
            message: 'Article successfully verified and saved to database!',
            data: newArticle
        });
    } catch (error){
        res.status(500).json({ status: 'error', message: 'Internal server error while saving article to database!'});
    }
});

app.put('/api/articles/:id', mongoSanitize({ replaceWith: '_' }), async (req, res) => {
    try {
        const {id} = req.params;
        let {title, content, category, link} = req.body;

        if (!title || !content) {
            return res.status(400).json({ status: 'error', message: 'Title and content are required fields!'});
        }

        title = title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        content = content.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        const updatedArticle = await Article.findByIdAndUpdate(
            id,
            { title, content, category, link },
            { new: true, runValidators: true }
        );

        if (!updatedArticle) {
            return res.status(404).json({ status: 'error', message: 'Article not found with this ID!'});
        }

        console.log(`Article updated in database: ${updatedArticle.title}`);

        res.status(200).json({
            status: 'success',
            message: 'Article successfully updated!',
            data: updatedArticle
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Internal server error while updating article in database!'});
    }
});

// Final Start Logic
const dbURI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;

if (!dbURI) {
    console.error("ERROR: MONGO_URI is not defined in environment variables!");
    process.exit(1);
}

mongoose.connect(dbURI)
    .then(() => {
        console.log('Secure connection established with MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
