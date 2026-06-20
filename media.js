let db = {
    articles: []
};

async function fetchData() {
    try {
        const response = await fetch('http://localhost:3000/api/articles');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const jsonResponse = await response.json();
        
        if (jsonResponse.status === 'success' && jsonResponse.data) {
            db.articles = jsonResponse.data.filter(article => 
                article.category && article.category.toLowerCase() === 'media'
            );
        } else {
            db.articles = [];
        }
        renderAll();
    } catch (err) {
        console.error("Database connection error!", err);
        const container = document.getElementById("mediaContainer");
        if (container) {
            container.innerHTML = `<p class="error-msg">Secure connection to MongoDB failed.</p>`;
        }
    }
}

async function syncArticle(articleData) {
    try {
        const response = await fetch('http://localhost:3000/api/articles', {
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

async function addArticle() {
    const title = document.getElementById("articleTitleInput")?.value.trim();
    const content = document.getElementById("articleContentInput")?.value.trim();
    const link = document.getElementById("articleLinkInput")?.value.trim();
    const category = "Media";

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
    const container = document.getElementById("mediaContainer");
    if (!container) return;

    if (!db.articles || db.articles.length === 0) {
        container.innerHTML = `<p class="no-data-msg">No secure media records found in the network.</p>`;
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
            <div class="article-meta">
                <span class="category">${article.category}</span>
                <span class="date">${formattedDate}</span>
            </div>
            <h2 class="article-title">${article.title}</h2>
            <div class="article-content">
                ${article.content}
            </div>
            <div class="article-footer">
                ${article.link ? `<a href="${article.link}" target="_blank" class="read-more-link">Source Evidence →</a>` : '<span></span>'}
            </div>
        `;
        container.appendChild(articleCard);
    });
}

fetchData();