let db = {
    articles: []
};

const API_URL = 'http://51.21.245.87:3000/api/articles';

async function fetchData() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const jsonResponse = await response.json();
        
        if (jsonResponse.status === 'success' && jsonResponse.data) {
            db.articles = jsonResponse.data;
        } else {
            db.articles = [];
        }

        renderAll();
    } catch (err) {
        console.error("Database connection error!", err);
        const container = document.getElementById("articlesContainer");
        if (container) {
            container.innerHTML = `<p style="color: #ff4a4a;">Secure connection to MongoDB failed.</p>`;
        }
    }
}

async function syncArticle(articleData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(articleData)
        });

        const jsonResponse = await response.json();
        if (jsonResponse.status === 'success') {
            await fetchData();
        }
    } catch (err) {
        console.error("Synchronization error:", err);
    }
}

function loadPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.hidden = true;
    });
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.hidden = false;
}

async function addArticle() {
    const title = document.getElementById("articleTitleInput")?.value.trim();
    const content = document.getElementById("articleContentInput")?.value.trim();
    const category = document.getElementById("articleCategoryInput")?.value.trim() || "General";
    const link = document.getElementById("articleLinkInput")?.value.trim();

    if (!title || !content) {
        alert("Title and content are required fields!");
        return;
    }

    const newArticlePayload = { title, content, category, link };

    if (document.getElementById("articleTitleInput")) document.getElementById("articleTitleInput").value = "";
    if (document.getElementById("articleContentInput")) document.getElementById("articleContentInput").value = "";
    if (document.getElementById("articleLinkInput")) document.getElementById("articleLinkInput").value = "";

    await syncArticle(newArticlePayload);
}

function renderAll() {
    const container = document.getElementById("articlesContainer");
    if (!container) return;

    if (!db.articles || db.articles.length === 0) {
        container.innerHTML = `<p style="color: #888;">No secure records found in the network.</p>`;
        return;
    }

    container.innerHTML = "";

    db.articles.forEach(article => {
        const articleCard = document.createElement("article");
        articleCard.className = "article-card";

        const formattedDate = new Date(article.createdAt).toLocaleDateString("en-US", {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        articleCard.innerHTML = `
            <div class="article-meta" style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.85rem; color: #888;">
                <span class="category" style="background: rgba(0, 255, 153, 0.1); color: #00ff99; padding: 2px 8px; border-radius: 3px;">${article.category}</span>
                <span class="date">${formattedDate}</span>
            </div>
            <h2 class="article-title" style="margin: 10px 0; color: #fff;">${article.title}</h2>
            <div class="article-content" style="color: #ccc; font-size: 0.95rem; line-height: 1.6; margin-bottom: 15px; text-align: justify;">
                ${article.content}
            </div>
            <div class="article-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; border-top: 1px solid #333; padding-top: 10px;">
                ${article.link ? `<a href="${article.link}" target="_blank" style="color: #00bfff; text-decoration: none; font-size: 0.9rem; font-weight: bold;">Source Evidence →</a>` : '<span></span>'}
            </div>
        `;
        container.appendChild(articleCard);
    });
}

async function deleteArticle(id) {
    if (!confirm("Are you sure you want to permanently delete this article?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        const jsonResponse = await response.json();
        if (jsonResponse.status === 'success') {
            await fetchData();
        }
    } catch (err) {
        console.error("Error executing delete command:", err);
    }
}

fetchData()
