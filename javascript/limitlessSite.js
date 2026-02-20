document.addEventListener("DOMContentLoaded", function () {

    const VALID_PAGES = ["home", "creations", "projects", "news", "aboutMe"];
    const SPECIAL_PAGES = ["news"];

    async function loadTabContent(pageKey) {
        try {
            const response = await fetch(`./tabs/${pageKey}.html`);
            if (response.ok) {
                return await response.text();
            }
        } catch (error) {
            console.warn(`Failed to load tab content: ${pageKey}`, error);
        }
        return `<p>Failed to load content for ${pageKey}.</p>`;
    }


    document.querySelectorAll('img').forEach(img => {
        img.setAttribute('draggable', 'false');
        img.addEventListener('dragstart', e => e.preventDefault());
    });

    const limitlessLinks = document.getElementById("limitlessLinks");
    const linkMenuBox = document.getElementById("linkMenuBox");
    const contentBlocker = document.getElementById("contentBlocker");
    const linkBoxes = document.getElementById("linkBoxes");
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
        linkMenuBox.style.top = "-4px";
        linkMenuBox.style.left = "45vw";
        contentBlocker.style.backgroundColor = "rgba(0, 0, 0, 0%)";
        contentBlocker.style.opacity = "0%";
        linkBoxes.style.opacity = "0%";
        linkBoxes.style.transitionDelay = "0s";
        linkMenuBox.style.transitionDelay = ".5s";
        contentBlocker.style.transitionDelay = ".5s";
        linksExpanded = false;
    }

    const pageText = document.getElementById("pageText");
    const pageContent = document.getElementById("pageContent");
    const pageLinks = document.querySelectorAll(".categoryLink[data-page]");
    const contentFadeMs = 250;
    const creationsMobileQuery = window.matchMedia("(orientation: portrait)");
    let currentPageKey = null;
    let contentFadeTimeout = null;
    let creationsMediaQueryListenerBound = false;

    let newsCards = [];
    let newsFullViewOpen = false;

    async function loadNewsCards() {
        newsCards = [];
        
        try {
            // Fetch the news manifest file
            const manifestResponse = await fetch('./news/news-manifest.json');
            if (!manifestResponse.ok) {
                console.warn('Failed to load news manifest');
                return;
            }
            
            const manifest = await manifestResponse.json();
            const newsFiles = manifest.newsFiles || [];

            for (const file of newsFiles) {
                try {
                    const response = await fetch(`./news/${file}`);
                    if (response.ok) {
                    const html = await response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, "text/html");
                    const cardDiv = doc.querySelector("div[data-card-title]");

                    if (cardDiv) {
                        // Extract date from filename (yyyy-mm-dd format)
                        const fileDate = file.substring(0, 10);
                        
                        newsCards.push({
                            id: file.replace(".html", ""),
                            title: cardDiv.getAttribute("data-card-title"),
                            description: cardDiv.getAttribute("data-card-description"),
                            image: cardDiv.getAttribute("data-card-image"),
                            date: cardDiv.getAttribute("data-card-date"),
                            fileDate: fileDate,
                            fullContent: html
                        });
                    }
                }
            } catch (error) {
                console.warn(`Failed to load news file: ${file}`, error);
            }
        }
        } catch (error) {
            console.warn('Error loading news cards:', error);
        }
        
        // Sort by date in descending order (newest first)
        newsCards.sort((a, b) => b.fileDate.localeCompare(a.fileDate));
    }

    function renderNewsGrid() {
        if (!pageText) return;

        pageText.innerHTML = "";

        const newsTitle = document.createElement("h2");
        newsTitle.textContent = "News";
        const newsFeaturedLabel = document.createElement("h3");
        newsFeaturedLabel.textContent = "Featured";
        const otherNewsLabel = document.createElement("h3");
        otherNewsLabel.textContent = "Other News";

        pageText.appendChild(newsTitle);
        pageText.appendChild(newsFeaturedLabel);

        // Render featured card (most recent)
        if (newsCards.length > 0) {
            const featuredCard = newsCards[0];
            const featuredElement = document.createElement("div");
            featuredElement.className = "news-featured-card";
            featuredElement.innerHTML = `
                <div class="news-card-image-container">
                    <img src="${featuredCard.image}" alt="${featuredCard.title}" class="news-card-image">
                </div>
                <div class="news-card-content">
                    <h3 class="news-card-title">${featuredCard.title}</h3>
                    <p class="news-card-date">${featuredCard.date || ""}</p>
                    <p class="news-card-description">${featuredCard.description}</p>
                </div>
            `;
            featuredElement.addEventListener("click", () => showNewsFullView(featuredCard));
            pageText.appendChild(featuredElement);

            // Trigger fade-in animation
            setTimeout(() => {
                featuredElement.style.opacity = "1";
                featuredElement.style.transform = "translateY(0)";
            }, 10);
        }

        // Place this underneath the featured card
        pageText.appendChild(otherNewsLabel);

        // Render remaining cards in grid
        if (newsCards.length > 1) {
            const gridContainer = document.createElement("div");
            gridContainer.id = "newsGrid";
            gridContainer.className = "news-grid";

            newsCards.slice(1).forEach((card, index) => {
                const cardElement = document.createElement("div");
                cardElement.className = "news-card";
                cardElement.innerHTML = `
                    <img src="${card.image}" alt="${card.title}" class="news-card-image">
                    <h3 class="news-card-title">${card.title}</h3>
                    <p class="news-card-date">${card.date || ""}</p>
                    <p class="news-card-description">${card.description}</p>
                `;
                cardElement.addEventListener("click", () => showNewsFullView(card));
                gridContainer.appendChild(cardElement);
                
                // Stagger the fade-in animation for each card
                setTimeout(() => {
                    cardElement.style.opacity = "1";
                    cardElement.style.transform = "translateY(0)";
                }, 50 + (index * 50));
            });

            pageText.appendChild(gridContainer);
        }
        
        newsFullViewOpen = false;
    }

    function showNewsFullView(card) {
        if (!pageContent || newsFullViewOpen) return;

        // Create backdrop blur overlay
        const backdrop = document.createElement("div");
        backdrop.className = "news-overlay-backdrop";
        backdrop.id = "newsOverlayBackdrop";
        backdrop.addEventListener("click", closeNewsFullView);
        
        // Create back button
        const backButton = document.createElement("button");
        backButton.className = "news-back-button";
        const backButtonIcon = document.createElement("img");
        backButtonIcon.src = "../assets/back.svg";
        backButtonIcon.alt = "Back";
        backButtonIcon.className = "news-back-button-icon";
        backButton.appendChild(backButtonIcon);
        backButton.addEventListener("click", closeNewsFullView);
        
        // Create expanded card container
        const expandedCard = document.createElement("div");
        expandedCard.className = "news-expanded-card";
        expandedCard.id = "newsExpandedCard";
        
        // Add banner image
        const bannerImage = document.createElement("img");
        bannerImage.src = card.image;
        bannerImage.alt = card.title;
        bannerImage.className = "news-expanded-banner";
        
        // Add content
        const contentDiv = document.createElement("div");
        contentDiv.className = "news-expanded-content";
        contentDiv.innerHTML = card.fullContent;
        
        expandedCard.appendChild(bannerImage);
        expandedCard.appendChild(contentDiv);
        
        // Append to pageContent
        pageContent.appendChild(backdrop);
        pageContent.appendChild(backButton);
        pageContent.appendChild(expandedCard);
        
        // Trigger animations
        requestAnimationFrame(() => {
            backdrop.classList.add("visible");
            backButton.classList.add("visible");
            expandedCard.classList.add("visible");
        });
        
        newsFullViewOpen = true;
    }
    
    function closeNewsFullView() {
        const backdrop = document.getElementById("newsOverlayBackdrop");
        const expandedCard = document.getElementById("newsExpandedCard");
        const backButton = document.querySelector(".news-back-button");
        
        if (!backdrop || !expandedCard || !backButton) return;
        
        // Remove visible class to trigger fade out
        backdrop.classList.remove("visible");
        backButton.classList.remove("visible");
        expandedCard.classList.remove("visible");
        
        // Remove elements after transition
        setTimeout(() => {
            if (backdrop.parentNode) backdrop.remove();
            if (expandedCard.parentNode) expandedCard.remove();
            if (backButton.parentNode) backButton.remove();
            newsFullViewOpen = false;
        }, 300);
    }

    function getValidPageKey(pageKey) {
        if (VALID_PAGES.includes(pageKey)) {
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

    function initializeCreationsMedia() {
        const creationsTitle = pageText ? pageText.querySelector("h2") : null;
        const creationsLayout = pageText ? pageText.querySelector(".creations-layout") : null;
        const detailPagesRoot = pageText ? pageText.querySelector(".creations-detail-pages") : null;

        const imageElements = document.querySelectorAll(".creations-layout img[data-mobile-src]");
        imageElements.forEach(imageElement => {
            if (!imageElement.dataset.desktopSrc) {
                imageElement.dataset.desktopSrc = imageElement.getAttribute("src") || "";
            }
        });

        const creationVideoIds = ["musicVideo", "writingVideo", "gamesVideo", "videosVideo", "artVideo"];

        creationVideoIds.forEach(videoId => {
            const videoElement = document.getElementById(videoId);
            if (!videoElement || videoElement.tagName !== "VIDEO") {
                return;
            }

            const creationCard = videoElement.closest(".creation-card");
            if (!creationCard) {
                return;
            }

            videoElement.muted = true;
            videoElement.loop = true;
            videoElement.playsInline = true;
            videoElement.disablePictureInPicture = true;
            videoElement.disableRemotePlayback = true;
            videoElement.controls = false;
            videoElement.setAttribute("playsinline", "");
            videoElement.setAttribute("disablepictureinpicture", "");
            videoElement.setAttribute("disableremoteplayback", "");
            videoElement.setAttribute("controlslist", "nodownload noplaybackrate noremoteplayback nofullscreen");

            const sourceElement = videoElement.querySelector("source");
            if (sourceElement && !videoElement.dataset.desktopSrc) {
                videoElement.dataset.desktopSrc = sourceElement.getAttribute("src") || "";
            }

            creationCard.addEventListener("mouseenter", function () {
                videoElement.play().catch(() => {});
            });

            creationCard.addEventListener("mouseleave", function () {
                videoElement.pause();
            });
        });

        if (creationsTitle && creationsLayout && detailPagesRoot) {
            const defaultTitleText = creationsTitle.textContent || "Creations";
            let activeDetailView = null;
            let activeBackButton = null;
            let activeFadeOverlay = null;

            function closeCreationDetailView() {
                // Create fade overlay
                const fadeOverlay = document.createElement("div");
                fadeOverlay.className = "creations-fade-overlay";
                pageContent.appendChild(fadeOverlay);

                // Fade to black
                setTimeout(() => {
                    fadeOverlay.classList.add("visible");
                }, 10);

                // After fade to black completes, remove content and show cards
                setTimeout(() => {
                    if (activeFadeOverlay) {
                        activeFadeOverlay.remove();
                        activeFadeOverlay = null;
                    }

                    if (activeDetailView) {
                        activeDetailView.remove();
                        activeDetailView = null;
                    }

                    if (activeBackButton) {
                        activeBackButton.remove();
                        activeBackButton = null;
                    }

                    creationsTitle.textContent = defaultTitleText;
                    creationsTitle.style.position = "";
                    creationsTitle.style.zIndex = "";
                    creationsLayout.style.display = "";

                    // Fade out black overlay to reveal cards
                    setTimeout(() => {
                        fadeOverlay.classList.remove("visible");
                    }, 10);

                    // Remove overlay after fade out completes
                    setTimeout(() => {
                        if (fadeOverlay.parentNode) {
                            fadeOverlay.remove();
                        }
                    }, 310);
                }, 300);
            }

            function createBackgroundMediaFromCard(cardElement) {
                const customBackgroundSrc = cardElement.dataset.backgroundSrc;

                if (customBackgroundSrc) {
                    const isVideo = /\.(mp4|webm|ogg)$/i.test(customBackgroundSrc);
                    if (isVideo) {
                        const backgroundVideo = document.createElement("video");
                        backgroundVideo.muted = true;
                        backgroundVideo.loop = true;
                        backgroundVideo.autoplay = true;
                        backgroundVideo.playsInline = true;
                        backgroundVideo.setAttribute("playsinline", "");
                        backgroundVideo.src = customBackgroundSrc;
                        backgroundVideo.play().catch(() => {});
                        return backgroundVideo;
                    } else {
                        const backgroundImage = document.createElement("img");
                        backgroundImage.src = customBackgroundSrc;
                        backgroundImage.alt = "";
                        return backgroundImage;
                    }
                }

                const videoElement = cardElement.querySelector("video");
                if (videoElement) {
                    const sourceElement = videoElement.querySelector("source");
                    const videoSrc = sourceElement ? sourceElement.getAttribute("src") : "";
                    if (videoSrc) {
                        const backgroundVideo = document.createElement("video");
                        backgroundVideo.muted = true;
                        backgroundVideo.loop = true;
                        backgroundVideo.autoplay = true;
                        backgroundVideo.playsInline = true;
                        backgroundVideo.setAttribute("playsinline", "");
                        backgroundVideo.src = videoSrc;
                        backgroundVideo.play().catch(() => {});
                        return backgroundVideo;
                    }
                }

                const imageElement = cardElement.querySelector("img");
                if (imageElement) {
                    const backgroundImage = document.createElement("img");
                    backgroundImage.src = imageElement.getAttribute("src") || "";
                    backgroundImage.alt = "";
                    return backgroundImage;
                }

                return document.createElement("div");
            }

            function openCreationDetailView(cardElement) {
                const creationKey = cardElement.dataset.creationKey;
                if (!creationKey) {
                    return;
                }

                const detailTemplate = detailPagesRoot.querySelector(`.creation-detail-page[data-creation-key="${creationKey}"]`);
                if (!detailTemplate) {
                    return;
                }

                closeCreationDetailView();

                // Create fade overlay
                const fadeOverlay = document.createElement("div");
                fadeOverlay.className = "creations-fade-overlay";
                pageContent.appendChild(fadeOverlay);
                activeFadeOverlay = fadeOverlay;

                // Fade to black
                setTimeout(() => {
                    fadeOverlay.classList.add("visible");
                }, 10);

                // After fade to black completes, show content
                setTimeout(() => {
                    const nextTitle = cardElement.querySelector(".creation-title")?.textContent || defaultTitleText;
                    creationsTitle.textContent = nextTitle;
                    creationsTitle.style.position = "relative";
                    creationsTitle.style.zIndex = "2";
                    creationsLayout.style.display = "none";

                    const backButton = document.createElement("button");
                    backButton.className = "creations-inline-back-button";
                    backButton.type = "button";
                    backButton.style.position = "relative";
                    backButton.style.zIndex = "2";
                    const backIcon = document.createElement("img");
                    backIcon.src = "../assets/back.svg";
                    backIcon.alt = "Back";
                    backIcon.className = "creations-back-button-icon";
                    backButton.appendChild(backIcon);
                    backButton.addEventListener("click", closeCreationDetailView);
                    creationsTitle.insertAdjacentElement("beforebegin", backButton);
                    activeBackButton = backButton;

                    const detailView = document.createElement("div");
                    detailView.className = "creations-detail-view";

                    const backgroundLayer = document.createElement("div");
                    backgroundLayer.className = "creations-detail-background";
                    backgroundLayer.appendChild(createBackgroundMediaFromCard(cardElement));

                    const contentLayer = document.createElement("div");
                    contentLayer.className = "creations-detail-content";
                    const clonedContent = detailTemplate.cloneNode(true);
                    const redundantHeading = clonedContent.querySelector("h3");
                    if (redundantHeading) {
                        redundantHeading.remove();
                    }
                    contentLayer.appendChild(clonedContent);

                    detailView.appendChild(backgroundLayer);
                    detailView.appendChild(contentLayer);
                    creationsTitle.insertAdjacentElement("afterend", detailView);

                    activeDetailView = detailView;

                    // Fade out black overlay to reveal content
                    setTimeout(() => {
                        fadeOverlay.classList.remove("visible");
                    }, 10);

                    // Remove overlay after fade out completes
                    setTimeout(() => {
                        if (fadeOverlay.parentNode) {
                            fadeOverlay.remove();
                        }
                        activeFadeOverlay = null;
                    }, 310);
                }, 300);
            }

            creationsLayout.querySelectorAll(".creation-card").forEach(cardElement => {
                cardElement.addEventListener("click", function () {
                    openCreationDetailView(cardElement);
                });
            });
        }

        applyCreationsResponsiveSources();

        if (!creationsMediaQueryListenerBound) {
            creationsMobileQuery.addEventListener("change", applyCreationsResponsiveSources);
            creationsMediaQueryListenerBound = true;
        }
    }

    function applyCreationsResponsiveSources() {
        const useMobileSource = creationsMobileQuery.matches;

        document.querySelectorAll(".creations-layout img[data-mobile-src]").forEach(imageElement => {
            const desktopSrc = imageElement.dataset.desktopSrc || imageElement.getAttribute("src") || "";
            const mobileSrc = imageElement.dataset.mobileSrc || "";
            const nextSrc = useMobileSource && mobileSrc ? mobileSrc : desktopSrc;

            if (nextSrc && imageElement.getAttribute("src") !== nextSrc) {
                imageElement.setAttribute("src", nextSrc);
            }
        });

        document.querySelectorAll(".creations-layout video[data-mobile-src]").forEach(videoElement => {
            const sourceElement = videoElement.querySelector("source");
            if (!sourceElement) {
                return;
            }

            const desktopSrc = videoElement.dataset.desktopSrc || sourceElement.getAttribute("src") || "";
            const mobileSrc = videoElement.dataset.mobileSrc || "";
            const nextSrc = useMobileSource && mobileSrc ? mobileSrc : desktopSrc;

            if (nextSrc && sourceElement.getAttribute("src") !== nextSrc) {
                const wasPlaying = !videoElement.paused;
                sourceElement.setAttribute("src", nextSrc);
                videoElement.load();

                if (wasPlaying) {
                    videoElement.play().catch(() => {});
                }
            }
        });
    }

    async function applyPageContent(pageKey) {
        const validPageKey = getValidPageKey(pageKey);

        if (pageText) {
            pageText.innerHTML = "";

            if (SPECIAL_PAGES.includes(validPageKey)) {
                if (validPageKey === "news") {
                    if (newsCards.length === 0) {
                        const loadingMsg = document.createElement("p");
                        loadingMsg.textContent = "Loading news...";
                        pageText.appendChild(loadingMsg);
                    } else {
                        renderNewsGrid();
                    }
                }
            } else {
                const loadingMsg = document.createElement("p");
                loadingMsg.textContent = "Loading...";
                pageText.appendChild(loadingMsg);

                const content = await loadTabContent(validPageKey);
                pageText.innerHTML = content;

                if (validPageKey === "creations") {
                    initializeCreationsMedia();
                }
            }
        }

        setActiveLink(validPageKey);
        currentPageKey = validPageKey;
    }

    async function renderPage(pageKey, useFade = true) {
        if (currentPageKey === pageKey) {
            return;
        }

        if (!useFade || !pageContent) {
            await applyPageContent(pageKey);
            return;
        }

        if (contentFadeTimeout) {
            clearTimeout(contentFadeTimeout);
        }

        pageContent.classList.add("is-fading");

        contentFadeTimeout = setTimeout(async function () {
            await applyPageContent(pageKey);
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

    loadNewsCards().then(() => {
        renderPage("home", false);
    });
});