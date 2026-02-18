document.addEventListener("DOMContentLoaded", function () {

    const PAGE_CONTENT = {
        home: {
            title: "Welcome to Limitless!",
            paragraphs: [
                "My website is still in progress, but I'm glad you've stopped by! I'm working hard to make a place that I can share my projects and creation updates with you. Check back soon! I'm working on adding new things as often as I can.",
                "If you'd like to see some of my current projects, please check my other pages on this website!",
                "In the meantime, visit my <a href=\"https://www.youtube.com/@thelimitless00\" target=\"_blank\">Youtube Channel</a> or <a href=\"https://github.com/thelimitless00\" target=\"_blank\">GitHub</a>!"
            ]
        },
        creations: {
            title: "Creations",
            paragraphs: [
                "This section is where your creations overview text goes.",
                "Edit the text in PAGE_CONTENT.creations inside javascript/limitlessSite.js."
            ]
        },
        projects: {
            title: "Projects",
            paragraphs: [
                "This section is where your projects overview text goes.",
                "Edit the text in PAGE_CONTENT.projects inside javascript/limitlessSite.js."
            ]
        },
        news: {
            title: "Latest News",
            isSpecial: true
        },
        aboutMe: {
            title: "About Me",
            paragraphs: [
                "This section is where your About Me text goes.",
                "Edit the text in PAGE_CONTENT.aboutMe inside javascript/limitlessSite.js."
            ]
        }
    };


    document.querySelectorAll('img').forEach(img => {
        img.setAttribute('draggable', 'false');
        img.addEventListener('dragstart', e => e.preventDefault());
    });

    const limitlessLinks = document.getElementById("limitlessLinks");
    const linkMenuBox = document.getElementById("linkMenuBox");
    const contentBlocker = document.getElementById("contentBlocker");
    const linkBoxes = document.getElementById("linkBoxes");
    const menuButton = document.getElementById("menuButton");
    const searchButton = document.getElementById("searchButton");
    const settingsButton = document.getElementById("settingsButton");
    let linksExpanded = false;

    function openExpandedLinks() {
        contentBlocker.style.pointerEvents = "auto";
        linkMenuBox.style.pointerEvents = "auto";
        linkBoxes.style.pointerEvents = "auto";
        linkMenuBox.style.height = "75vh";
        linkMenuBox.style.width = "75vw";
        linkMenuBox.style.top = "12.5vh";
        linkMenuBox.style.left = "12.5vw";
        contentBlocker.style.backgroundColor = "rgba(0, 0, 0, 50%)";
        contentBlocker.style.opacity = "100%";
        linkBoxes.style.opacity = "100%";
        linkBoxes.style.transitionDelay = ".5s";
        linkMenuBox.style.transitionDelay = "0s";
        contentBlocker.style.transitionDelay = "0s";
        linksExpanded = true;
    }
    function closeExpandedLinks() {
        contentBlocker.style.pointerEvents = "none";
        linkMenuBox.style.pointerEvents = "none";
        linkBoxes.style.pointerEvents = "none";
        linkMenuBox.style.height = "0px";
        linkMenuBox.style.width = "10vw";
        linkMenuBox.style.top = "0px";
        linkMenuBox.style.left = "45vw";
        contentBlocker.style.backgroundColor = "rgba(0, 0, 0, 0%)";
        contentBlocker.style.opacity = "0%";
        linkBoxes.style.opacity = "0%";
        linkBoxes.style.transitionDelay = "0s";
        linkMenuBox.style.transitionDelay = ".5s";
        contentBlocker.style.transitionDelay = ".5s";
        linksExpanded = false;
    }

    const pageTitle = document.getElementById("pageTitle");
    const pageText = document.getElementById("pageText");
    const pageContent = document.getElementById("pageContent");
    const pageLinks = document.querySelectorAll(".categoryLink[data-page]");
    const newsButton = document.getElementById("newsButton");
    const contentFadeMs = 250;
    const popupMessage = "Currently not functioning.";
    const popupHideDelayMs = 1500;
    let currentPageKey = null;
    let contentFadeTimeout = null;
    let popupHideTimeout = null;

    function createButtonPopup() {
        const popup = document.createElement("div");
        popup.id = "buttonNoticePopup";
        popup.setAttribute("role", "status");
        popup.setAttribute("aria-live", "polite");
        popup.textContent = popupMessage;
        document.body.appendChild(popup);
        return popup;
    }

    function getButtonPopup() {
        return document.getElementById("buttonNoticePopup") || createButtonPopup();
    }

    function showButtonPopup(targetButton) {
        if (!targetButton) {
            return;
        }

        const popup = getButtonPopup();
        const buttonRect = targetButton.getBoundingClientRect();

        popup.classList.remove("visible");

        const horizontalOffset = 10;
        const verticalOffset = -4;
        popup.style.top = `${buttonRect.top + verticalOffset}px`;

        if (targetButton.id === "settingsButton" || targetButton.id === "newsButton") {
            const leftPosition = buttonRect.left - popup.offsetWidth - horizontalOffset;
            popup.style.left = `${Math.max(horizontalOffset, leftPosition)}px`;
        } else {
            popup.style.left = `${buttonRect.right + horizontalOffset}px`;
        }

        requestAnimationFrame(() => {
            popup.classList.add("visible");
        });

        if (popupHideTimeout) {
            clearTimeout(popupHideTimeout);
        }

        popupHideTimeout = setTimeout(function () {
            popup.classList.remove("visible");
            popupHideTimeout = null;
        }, popupHideDelayMs);
    }

    let newsCards = [];
    let newsFullViewOpen = false;

    async function loadNewsCards() {
        const newsFiles = ["news-001.html", "news-002.html", "news-003.html"];
        newsCards = [];

        for (const file of newsFiles) {
            try {
                const response = await fetch(`./news/${file}`);
                if (response.ok) {
                    const html = await response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, "text/html");
                    const cardDiv = doc.querySelector("div[data-card-title]");

                    if (cardDiv) {
                        newsCards.push({
                            id: file.replace(".html", ""),
                            title: cardDiv.getAttribute("data-card-title"),
                            description: cardDiv.getAttribute("data-card-description"),
                            image: cardDiv.getAttribute("data-card-image"),
                            fullContent: html
                        });
                    }
                }
            } catch (error) {
                console.warn(`Failed to load news file: ${file}`, error);
            }
        }
    }

    function renderNewsGrid() {
        if (!pageTitle || !pageText) return;

        pageTitle.textContent = "News";
        pageText.innerHTML = "";

        const gridContainer = document.createElement("div");
        gridContainer.id = "newsGrid";
        gridContainer.className = "news-grid";

        newsCards.forEach(card => {
            const cardElement = document.createElement("div");
            cardElement.className = "news-card";
            cardElement.innerHTML = `
                <img src="${card.image}" alt="${card.title}" class="news-card-image">
                <h3 class="news-card-title">${card.title}</h3>
                <p class="news-card-description">${card.description}</p>
            `;
            cardElement.addEventListener("click", () => showNewsFullView(card));
            gridContainer.appendChild(cardElement);
        });

        pageText.appendChild(gridContainer);
        newsFullViewOpen = false;
    }

    function showNewsFullView(card) {
        if (!pageText) return;

        pageText.innerHTML = "";
        const backButton = document.createElement("button");
        backButton.className = "news-back-button";
        backButton.textContent = "← Back to News";
        backButton.addEventListener("click", () => renderNewsGrid());

        const fullViewContainer = document.createElement("div");
        fullViewContainer.className = "news-full-view";
        fullViewContainer.innerHTML = card.fullContent;

        pageText.appendChild(backButton);
        pageText.appendChild(fullViewContainer);
        newsFullViewOpen = true;
    }

    function getValidPageKey(pageKey) {
        if (Object.prototype.hasOwnProperty.call(PAGE_CONTENT, pageKey)) {
            return pageKey;
        }

        return "home";
    }

    function setActiveLink(pageKey) {
        pageLinks.forEach(link => {
            const isActive = link.dataset.page === pageKey;
            link.classList.toggle("activePage", isActive);
        });
    }

    function applyPageContent(pageKey) {
        const validPageKey = getValidPageKey(pageKey);
        const page = PAGE_CONTENT[validPageKey];

        if (pageTitle && pageText) {
            pageTitle.textContent = page.title;
            pageText.innerHTML = "";

            if (validPageKey === "news" && page.isSpecial) {
                if (newsCards.length === 0) {
                    const loadingMsg = document.createElement("p");
                    loadingMsg.textContent = "Loading news...";
                    pageText.appendChild(loadingMsg);
                } else {
                    renderNewsGrid();
                }
            } else if (page.paragraphs) {
                page.paragraphs.forEach(paragraphText => {
                    const paragraph = document.createElement("p");
                    paragraph.innerHTML = paragraphText;
                    pageText.appendChild(paragraph);
                });
            }
        }

        setActiveLink(validPageKey);
        currentPageKey = validPageKey;
    }

    function renderPage(pageKey, useFade = true) {
        if (currentPageKey === pageKey) {
            return;
        }

        if (!useFade || !pageContent) {
            applyPageContent(pageKey);
            return;
        }

        if (contentFadeTimeout) {
            clearTimeout(contentFadeTimeout);
        }

        pageContent.classList.add("is-fading");

        contentFadeTimeout = setTimeout(function () {
            applyPageContent(pageKey);
            pageContent.classList.remove("is-fading");
            contentFadeTimeout = null;
        }, contentFadeMs);
    }


    if (limitlessLinks && linkMenuBox && contentBlocker && linkBoxes) {
        limitlessLinks.addEventListener("click", function () {
            if (linksExpanded === false) {
                openExpandedLinks();
            } else {
                closeExpandedLinks();
            }
        });
        contentBlocker.addEventListener("click", function () {
            if (linksExpanded === false) {
                openExpandedLinks();
            } else {
                closeExpandedLinks();
            }
        });
    }

    pageLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            renderPage(link.dataset.page);
        });
    });

    if (newsButton) {
        newsButton.addEventListener("click", function () {
            showButtonPopup(newsButton);
        });
    }

    [menuButton, searchButton, settingsButton].forEach(button => {
        if (!button) {
            return;
        }

        button.addEventListener("click", function () {
            showButtonPopup(button);
        });
    });

    loadNewsCards().then(() => {
        renderPage("home", false);
    });
});