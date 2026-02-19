/* This module contains the main services and functions for initializing the home page, handling page show events, loading the NASA Picture of the Day (APOD), showing the welcome dialog, managing visitor state, and rendering the favorite gallery. It imports necessary functions from other modules to perform these tasks. The main functions include initHomePage, handlePageShow, handleApodFavoriteUpdated, loadPicOfTheDay, showWelcomeDialog, getVisitorState, setVisitorState, and renderFavoriteGallery. These functions work together to create an interactive and personalized experience for users visiting the solar system explorer website. */



import { initSolarSystem } from "./solarSystem.mjs";
import { isFavoriteByKey, getLocalStorage, loadFavoritesByKey, loadPageMutuals, setLocalStorage, toggleFavoriteByKey } from "./utils.mjs";
import { buildFavoriteCard, createApodCard, createFavoriteToggle } from "./cardBuilder.mjs";
import { buildApodArchiveUrl, buildApodFavorite, getApodData, preloadNinjaPlanetsData } from "./dataStuff.mjs";



const RESOURCE_FAVORITES_KEY = "favoriteResources";
const APOD_FAVORITES_KEY = "favoriteApods";
const APOD_META_URL = "https://apod.nasa.gov/apod/astropix.html";

const VISITOR_STORAGE_KEY = "visitorState";
const SESSION_WELCOME_KEY = "welcomeShown";



export function initHomePage()
/* Calls all the necessary functions to initialize the home page of the solar system explorer.*/ {
    initSolarSystem();
    loadPageMutuals();
    preloadNinjaPlanetsData();
    loadPicOfTheDay();
    renderFavoriteGallery();
}



export function handlePageShow(event)
/* When back/forward navigation occurs, I found that the fly-in animation got stuck and because of other settings, we couldnt interact with the page unless we refreshed. This solves it by reloading a page if it was loaded from the bfcache (back-forward cache) which is what happens when navigating with the back and forward buttons. This way, we ensure that the page is in a fresh state and the animations work correctly when the user navigates back to it. */ {
    if (event.persisted) {
        window.location.reload();
    }
}



export function handleApodFavoriteUpdated()
/* Used to renderfavorite gallery again when apod favorites is updated. I could just use the original renderFavoriteGallery function, but I thought it would be better to have a separate function that is specifically for handling the APOD favorite updates, in case we want to add any additional logic or functionality in the future related to APOD favorites. This way, we keep the code organized and maintainable. */ {
    renderFavoriteGallery();
}



async function loadPicOfTheDay()
/* This function loads the NASA Picture of the Day (APOD) and displays it on the page. It fetches the APOD data, builds the caption and favorite button, creates the card element for the APOD, and appends it to the container. If there is an error during this process, it logs the error and displays a message indicating that the APOD could not be loaded. */ {
    const container = document.getElementById("pic-of-the-day-content");
    if (!container) return;
    container.textContent = "";

    try {
        const apod = await getApodData();
        const title = apod?.title ?? "Picture of the Day";
        const date = apod?.date ?? "";
        const explanation = apod?.explanation ?? "";
        const mediaType = apod?.media_type ?? "image";
        const mediaUrl = apod?.url ?? "";
        const thumbnailUrl = apod?.thumbnail_url ?? "";
        const archiveUrl = buildApodArchiveUrl(date);
        const favoriteItem = buildApodFavorite(apod, title, date, mediaType, mediaUrl, thumbnailUrl, archiveUrl);

        const favoriteButton = createFavoriteToggle(favoriteItem, {
            isFavorite: isFavoriteByKey(APOD_FAVORITES_KEY, favoriteItem.id),
            onToggle: (item) => toggleFavoriteByKey(APOD_FAVORITES_KEY, item),
            onAfterToggle: () => {
                document.dispatchEvent(new CustomEvent("apodFavoriteUpdated"));
            },
        });

        const card = createApodCard({title, date, explanation, mediaType, mediaUrl, metaUrl: APOD_META_URL, favoriteButton});
        container.appendChild(card);
        showWelcomeDialog(date);
    } catch (error) {
        console.error("Failed to load APOD", error);
        container.textContent = "Unable to load NASA picture of the day.";
    }
}



function showWelcomeDialog(apodDate)
/* This function shows a welcome dialog to the user when they visit the page. It checks if the user is a returning visitor and if there is a new APOD since their last visit, and customizes the welcome message accordingly. The dialog is displayed using a <dialog> element, and it can be closed by clicking a close button or by clicking outside the dialog. The function also updates the visitor state in localStorage to keep track of their last visit date and the last APOD date they saw. */
{
    const dialog = document.getElementById("welcome-modal-container");
    if (!dialog || typeof dialog.showModal !== "function") return;

    const today = new Date().toISOString().slice(0, 10);

    const state = getVisitorState();
    const isReturning = Boolean(state.lastVisitDate);
    let isNewApod = false;

    if (apodDate && state.lastApodDate && state.lastApodDate !== apodDate)
    // if these three conditions are met, it means there is a new APOD since the user's last visit:
        // apodDate is the date of the currently loaded APOD, which we get from the APOD data.
        // state.lastApodDate is the date of the last APOD that the user saw, which we stored in localStorage during their previous visit.
        // By comparing these two dates, we can determine if there is a new APOD that the user has not seen before. If they are different, it means there is a new APOD, and we set isNewApod to true to include that information in the welcome message.
    {
        isNewApod = true;
    }

    let titleText;
    if (isReturning) {
        titleText = "Welcome back Commander o7";
    } else {
        titleText = "Welcome to SolarSys Explorer o7";
    }
    let welcomeMessage;
    if (isReturning) {
        welcomeMessage = `Prepare for another exciting journey through our solar system!<br><br>Last flight logged: ${state.lastVisitDate}.`;
    } else {
        welcomeMessage = "Journey through our solar system and discover amazing facts and stunning images from NASA's APIs. Favorite your discoveries to easily find them later!";
    }

    if (isNewApod) {
        welcomeMessage += " Check out NASAs new Astronomical Picture of the Day.";
    }

    dialog.innerHTML = `
        <div class="welcome-modal">
            <h2 class="heading-font">${titleText}</h2>
            <p>${welcomeMessage}</p>
            <button class="welcome-close" type="button">Close</button>
        </div>
    `;

    const closeButton = dialog.querySelector(".welcome-close");
    if (closeButton) {
        closeButton.addEventListener("click", () => dialog.close(), {
            once: true,
        });
    }

    dialog.addEventListener("click", (event) => {
            if (event.target === dialog) {
                dialog.close();
            }
        },
        { once: true }
    );

    if (!sessionStorage.getItem(SESSION_WELCOME_KEY)) {
        dialog.showModal();
        sessionStorage.setItem(SESSION_WELCOME_KEY, "true");
    }
    setVisitorState({
        lastVisitDate: today,
        lastApodDate: apodDate || state.lastApodDate || "",
    });
}



function getVisitorState()
/* Get the visitor state from localStorage. This function retrieves the visitor's last visit date and the last APOD date they saw from localStorage. It returns an object containing these two pieces of information. If there is no stored data, it returns default values with empty strings for both dates. This is used for tracking the user's visit history and displaying relevant information in the welcome message. */
{
    const stored = getLocalStorage(VISITOR_STORAGE_KEY);
    if (stored && typeof stored === "object") {
        return {
            lastVisitDate: stored.lastVisitDate || "",
            lastApodDate: stored.lastApodDate || "",
        };
    }
    return { lastVisitDate: "", lastApodDate: "" };
}



function setVisitorState(state)
/* Set the visitor state in localStorage. This function takes an object containing the visitor's last visit date and the last APOD date they saw, and stores it in localStorage under the VISITOR_STORAGE_KEY. This allows us to keep track of the user's visit history and the APOD they last saw, which can be used to customize their experience when they return to the site. */
{
    setLocalStorage(VISITOR_STORAGE_KEY, state);
}



function renderFavoriteGallery()
/* This function renders the favorite gallery on the page. It retrieves the user's favorite NASA images and APODs from localStorage, and creates cards for each of them to display in the gallery. If there are no favorites, it shows a message indicating that there are no favorites yet. The function also sets up the necessary event listeners for the favorite toggle buttons on each card, so that users can easily add or remove items from their favorites directly from the gallery. */
{
    const gallery = document.getElementById("favorites-gallery");
    if (!gallery) return;
    gallery.textContent = "";

    const resourceFavorites = loadFavoritesByKey(RESOURCE_FAVORITES_KEY);
    const apodFavorites = loadFavoritesByKey(APOD_FAVORITES_KEY);
    const hasResources = resourceFavorites.length > 0;
    const hasApods = apodFavorites.length > 0;

    if (!hasResources && !hasApods) {
        const empty = document.createElement("p");
        empty.className = "favorites-empty";
        empty.textContent = "No favorites yet. Save a NASA image or APOD to see it here.";
        gallery.appendChild(empty);
        return;
    }

    resourceFavorites.forEach((item) => {
        const metaLines = [];
        if (item?.planet) metaLines.push(`Planet: ${item.planet}`);
        if (item?.dateCreated) metaLines.push(`Date: ${item.dateCreated}`);
        if (item?.secondaryCreator) {
            metaLines.push(`Creator: ${item.secondaryCreator}`);
        }

        const card = buildFavoriteCard(item, {
            title: item?.title ?? "NASA image",
            alt: item?.title ?? "Favorite NASA image",
            metaLines,
            toggleBuilder: (resource) =>
                createFavoriteToggle(resource, {
                    isFavorite: true,
                    onToggle: (target) =>
                        toggleFavoriteByKey(RESOURCE_FAVORITES_KEY, target),
                    onAfterToggle: renderFavoriteGallery,
                }),
        });
        if (card) gallery.appendChild(card);
    });

    apodFavorites.forEach((item) => {
        const metaLines = ["Type: NASA Picture Of The Day"];
        if (item?.date) metaLines.push(`Date: ${item.date}`);

        const card = buildFavoriteCard(item, {
            title: item?.title ?? "NASA Picture of the Day",
            alt: item?.title ?? "Favorite APOD",
            metaLines,
            linkUrl: item?.archiveUrl,
            toggleBuilder: (apod) => // for APOD favorites, we build the favorite toggle button using the createFavoriteToggle function, passing in the APOD item and configuring it to be a favorite (isFavorite: true) with an onToggle function that will toggle the favorite status in localStorage when clicked. We also specify an onAfterToggle callback to re-render the favorite gallery after toggling, so that the UI updates to reflect the change in favorites.
                createFavoriteToggle(apod, {
                    isFavorite: true,
                    onToggle: (target) =>
                        toggleFavoriteByKey(APOD_FAVORITES_KEY, target),
                    onAfterToggle: renderFavoriteGallery,
                }),
        });
        if (card) gallery.appendChild(card);
    });
}
