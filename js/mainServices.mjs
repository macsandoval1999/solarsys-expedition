import { initSolarSystem } from "./solarSystem.mjs";
import {
    isFavoriteByKey,
    getLocalStorage,
    loadFavoritesByKey,
    loadPageMutuals,
    setLocalStorage,
    toggleFavoriteByKey,
} from "./utils.mjs";
import {
    buildFavoriteCard,
    createApodCard,
    createFavoriteToggle,
} from "./cardBuilder.mjs";
import {
    buildApodArchiveUrl,
    buildApodFavorite,
    getApodData,
    preloadNinjaPlanetsData,
} from "./dataStuff.mjs";

const RESOURCE_FAVORITES_KEY = "favoriteResources";
const APOD_FAVORITES_KEY = "favoriteApods";
const APOD_META_URL = "https://apod.nasa.gov/apod/astropix.html";
const VISITOR_STORAGE_KEY = "visitorState";
const SESSION_WELCOME_KEY = "welcomeShown";

export function initHomePage() {
    initSolarSystem();
    loadPageMutuals();
    preloadNinjaPlanetsData();
    loadPicOfTheDay();
    renderFavoriteGallery();
}

export function handlePageShow(event) {
    if (event.persisted) {
        window.location.reload();
    }
}

export function handleApodFavoriteUpdated() {
    renderFavoriteGallery();
}

async function loadPicOfTheDay() {
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
        const favoriteItem = buildApodFavorite(
            apod,
            title,
            date,
            mediaType,
            mediaUrl,
            thumbnailUrl,
            archiveUrl
        );

        const favoriteButton = createFavoriteToggle(favoriteItem, {
            isFavorite: isFavoriteByKey(APOD_FAVORITES_KEY, favoriteItem.id),
            onToggle: (item) => toggleFavoriteByKey(APOD_FAVORITES_KEY, item),
            onAfterToggle: () => {
                document.dispatchEvent(new CustomEvent("apodFavoriteUpdated"));
            },
        });

        const card = createApodCard({
            title,
            date,
            explanation,
            mediaType,
            mediaUrl,
            metaUrl: APOD_META_URL,
            favoriteButton,
        });

        container.appendChild(card);
        showWelcomeDialog(date);
    } catch (error) {
        console.error("Failed to load APOD", error);
        container.textContent = "Unable to load NASA picture of the day.";
    }
}

function showWelcomeDialog(apodDate) {
    const dialog = document.getElementById("welcome-modal-container");
    if (!dialog || typeof dialog.showModal !== "function") return;

    const today = new Date().toISOString().slice(0, 10);
    const normalizedApodDate =
        typeof apodDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(apodDate)
            ? apodDate
            : "";
    const state = getVisitorState();
    const isReturning = Boolean(state.lastVisitDate);
    const isNewApod = Boolean(
        apodDate && state.lastApodDate && state.lastApodDate !== apodDate
    );

    // const titleText = isReturning ? "Welcome back" : "Welcome";
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
        welcomeMessage += " Check out the new NASA Picture of the Day.";
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

    dialog.addEventListener(
        "click",
        (event) => {
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

function getVisitorState() {
    const stored = getLocalStorage(VISITOR_STORAGE_KEY);
    if (stored && typeof stored === "object") {
        return {
            lastVisitDate: stored.lastVisitDate || "",
            lastApodDate: stored.lastApodDate || "",
        };
    }
    return { lastVisitDate: "", lastApodDate: "" };
}

function setVisitorState(state) {
    setLocalStorage(VISITOR_STORAGE_KEY, state);
}

function renderFavoriteGallery() {
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
            toggleBuilder: (apod) =>
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
