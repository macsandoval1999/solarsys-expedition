/* Function to create stars in the background
Usages:
We use this function to add a dynamic starry background effect to the body of the webpage.*/
export function createStars() {
    const universe = document.querySelector("body");
    if (!universe) return;

    const docHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        window.innerHeight
    );

    for (let i = 0; i < 1000; i++) {
        const star = document.createElement("div");
        star.classList.add("star");
        star.style.top = `${Math.random() * docHeight}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.width = `${Math.random() * 2}px`;
        star.style.height = star.style.width;
        star.style.animationDuration = `${Math.random() * 3 + 2}s`;
        universe.appendChild(star);
    }
}



/* Function to get data from localStorage
Usages: */
export function getLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key));
}



/* Function to set data in localStorage
Usages: */
export function setLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

export function loadFavoritesByKey(storageKey) {
    const stored = getLocalStorage(storageKey);
    return Array.isArray(stored) ? stored : [];
}

export function saveFavoritesByKey(storageKey, favorites) {
    setLocalStorage(storageKey, favorites);
}

export function toggleFavoriteByKey(storageKey, item) {
    const favorites = loadFavoritesByKey(storageKey);
    const existingIndex = favorites.findIndex(
        (favorite) => favorite.id === item.id
    );

    if (existingIndex >= 0) {
        favorites.splice(existingIndex, 1);
        saveFavoritesByKey(storageKey, favorites);
        return false;
    }

    favorites.push(item);
    saveFavoritesByKey(storageKey, favorites);
    return true;
}

export function isFavoriteByKey(storageKey, id) {
    return loadFavoritesByKey(storageKey).some((favorite) => favorite.id === id);
}



/* Function to select a single DOM element
Usages: */
export function qs(selector, parent = document) {
    return parent.querySelector(selector);
}



/* Function to set click and touch event listeners
Usages: */
export function setClick(selector, callback) {
    qs(selector).addEventListener("touchend", (event) => {
        event.preventDefault();
        callback();
    });
    qs(selector).addEventListener("click", callback);
}



/* Function to get URL query parameters
Usages: */
export function getParam(param) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const product = urlParams.get(param);
    return product;
}


export function renderWithTemplate(template, parentElement, data, callback) {
    if (!parentElement) return;
    parentElement.innerHTML = template;
    if (callback) {
        callback(data);
    }
};

export function setText(element, value) {
    if (element) {
        element.textContent = value ?? "n/a";
    }
}

export function setHtml(element, value) {
    if (element) {
        element.innerHTML = value ?? "n/a";
    }
}

export function createStatusMessage(message) {
    const paragraph = document.createElement("p");
    paragraph.textContent = message;
    return paragraph;
}

async function loadTemplate(url) {
    const result = await fetch(url);
    const template = await result.text();
    return template;
}

export async function loadPageMutuals() {
    const headerTemplate = await loadTemplate(new URL("../assets/partials/header.html", import.meta.url));
    const footerTemplate = await loadTemplate(new URL("../assets/partials/footer.html", import.meta.url));
    const headerElement = document.getElementById("main-header");
    const footerElement = document.getElementById("main-footer");

    renderWithTemplate(headerTemplate, headerElement,);
    renderWithTemplate(footerTemplate, footerElement,);
    createStars();
    copyRightDates();
}

function copyRightDates() {
    const today = new Date(); 
    const year = document.querySelector("#current-year");
    year.innerHTML = `${today.getFullYear()}`;

    const lastModified = document.querySelector('#last-modified');
    lastModified.innerHTML = `Last Modification: ${document.lastModified}`;
}