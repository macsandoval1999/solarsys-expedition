export function createStars()
/* This function creates a dynamic starry background effect by adding star elements to the body of the webpage. 
It works by creating a large number of div elements with the class "star" and randomly positioning them within the viewport. Each star is given a random size and animation duration to create a twinkling effect. */ {
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



export function getLocalStorage(key)
/* This function retrieves data from localStorage for the given key. It parses the JSON string stored in localStorage and returns the corresponding JavaScript object. If the key does not exist, it returns null. */ {
    return JSON.parse(localStorage.getItem(key));
}



export function setLocalStorage(key, data)
/* This function stores data in localStorage for the given key. It converts the JavaScript object to a JSON string before storing it. */ {
    localStorage.setItem(key, JSON.stringify(data));
}



export function loadFavoritesByKey(storageKey)
/* This function loads favorite items from localStorage for the given key. It returns an array of favorite items. If no favorites are found, it returns an empty array. */ {
    const stored = getLocalStorage(storageKey);
    return Array.isArray(stored) ? stored : [];
}



export function saveFavoritesByKey(storageKey, favorites)
/* This function saves favorite items to localStorage for the given key. It converts the array of favorite items to a JSON string before storing it. */ {
    setLocalStorage(storageKey, favorites);
}



export function toggleFavoriteByKey(storageKey, item)
/* This function toggles a favorite item in localStorage for the given key. If the item is already in the favorites, it removes it; otherwise, it adds it. It returns true if the item was added to favorites, or false if it was removed. */ {
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



export function isFavoriteByKey(storageKey, id)
/* This function checks if a favorite item exists in localStorage for the given key. It returns true if the item is found, or false otherwise. */ {
    return loadFavoritesByKey(storageKey).some((favorite) => favorite.id === id);
}



export function renderWithTemplate(template, parentElement, data, callback)
/* This function renders a template into a parent element. It takes a template string, a parent element, optional data, and an optional callback function. The template is inserted into the parent element, and the callback is called with the data if provided. */ {
    if (!parentElement) return;
    parentElement.innerHTML = template;
    if (callback) {
        callback(data);
    }
};



export function setText(element, value)
/* This function sets the text content of an element. If the value is null or undefined, it sets the text content to "n/a". */ {
    if (element) {
        element.textContent = value ?? "n/a";
    }
}



export function setHtml(element, value)
/* This function sets the inner HTML of an element. If the value is null or undefined, it sets the inner HTML to "n/a". */ {
    if (element) {
        element.innerHTML = value ?? "n/a";
    }
}



export function createStatusMessage(message)
/* This function creates a paragraph element with the given message as its text content. It returns the created paragraph element. */ {
    const paragraph = document.createElement("p");
    paragraph.textContent = message;
    return paragraph;
}



async function loadTemplate(url)
/* This function loads a template from the given URL. It returns the template as a string. */ {
    const result = await fetch(url);
    const template = await result.text();
    return template;
}



export async function loadPageMutuals()
/* This function loads mutual components of the page, such as the header and footer. It fetches the header and footer templates, renders them into their respective elements, creates the starry background, and updates the copyright dates. */ {
    const headerTemplate = await loadTemplate(new URL("../assets/partials/header.html", import.meta.url));
    const footerTemplate = await loadTemplate(new URL("../assets/partials/footer.html", import.meta.url));
    const headerElement = document.getElementById("main-header");
    const footerElement = document.getElementById("main-footer");

    renderWithTemplate(headerTemplate, headerElement,);
    renderWithTemplate(footerTemplate, footerElement,);
    createStars();
    copyRightDates();
}



function copyRightDates()
/* This function updates the copyright dates on the page. It sets the current year and the last modification date of the document. */ {
    const today = new Date();
    const year = document.querySelector("#current-year");
    year.innerHTML = `${today.getFullYear()}`;

    const lastModified = document.querySelector('#last-modified');
    lastModified.innerHTML = `Last Modification: ${document.lastModified}`;
}