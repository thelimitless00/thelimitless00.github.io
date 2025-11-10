document.addEventListener("DOMContentLoaded", function () {


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
});