import {
    isFavoriteByKey,
    createStatusMessage,
    loadPageMutuals,
    setHtml,
    setText,
    toggleFavoriteByKey,
} from "./utils.mjs";
import {
    buildNasaCaption,
    createFavoriteToggle,
    createGalleryFigure,
} from "./cardBuilder.mjs";
import {
    buildFavoriteResource,
    findPlanetConfig,
    formatDistanceFromEarth,
    formatMass,
    formatPeriod,
    formatRadius,
    formatSemiMajorAxis,
    formatTemperature,
    getPlanetData,
    getPlanetImages,
    loadPlanetsConfig,
    resolveAssetPath,
    selectRandomItems,
    toTitleCase,
} from "./dataStuff.mjs";

const RESOURCE_FAVORITES_KEY = "favoriteResources";

export async function initPlanetPage() {
    await loadPageMutuals();
    const planetQuery = new URLSearchParams(window.location.search).get("planet");
    if (!planetQuery) {
        displayError("No planet selected.");
        return;
    }

    try {
        const [planetData, planetsConfig] = await Promise.all([
            getPlanetData(planetQuery),
            loadPlanetsConfig(),
        ]);

        const displayName =
            planetData.englishName ?? planetData.name ?? toTitleCase(planetQuery);
        updateHero(displayName, planetsConfig, planetQuery);
        populateDataCards(planetData);
        await populateImages(displayName);
    } catch (error) {
        console.error("Failed to load planet details", error);
        displayError("Unable to load planet details right now.");
    }
}

function updateHero(displayName, planetsConfig, planetQuery) {
    const heroElements = getHeroElements();
    const heroSection = document.getElementById("planet-hero");
    if (heroElements.name) {
        heroElements.name.textContent = displayName;
    }

    if (heroSection) {
        const isSaturn = displayName.toLowerCase() === "saturn";
        heroSection.classList.toggle("planet-hero-saturn", isSaturn);
    }

    const planetConfig = findPlanetConfig(planetsConfig, planetQuery);
    setHtml(
        heroElements.fullDescription,
        planetConfig?.fullDescription ?? planetConfig?.smallDescription
    );
    const preferredImage = resolveAssetPath(
        planetConfig?.imageMed ?? planetConfig?.imageSmall
    );
    const fallbackImage = resolveAssetPath(
        planetConfig?.imageSmall ?? planetConfig?.imageMed
    );

    if (heroElements.heroSource && preferredImage) {
        heroElements.heroSource.srcset = preferredImage;
    }

    if (heroElements.heroImg) {
        heroElements.heroImg.src = preferredImage ?? fallbackImage ?? "";
        heroElements.heroImg.alt = `${displayName} image`;
    }
}

function populateDataCards(planetData) {
    const infoElements = getInfoElements();
    setText(infoElements.mass, formatMass(planetData.mass));
    const radiusValue =
        planetData.meanRadius ?? planetData.radius ?? planetData.equaRadius;
    setText(infoElements.radius, formatRadius(radiusValue));

    const orbitalPeriod =
        planetData.sideralOrbit ??
        planetData.orbital_period ??
        planetData.orbitalPeriod ??
        planetData.period;
    setText(infoElements.orbitalPeriod, formatPeriod(orbitalPeriod));

    setText(infoElements.semiMajorAxis, formatSemiMajorAxis(planetData));
    setText(infoElements.distance, formatDistanceFromEarth(planetData));

    const temperature = planetData.avgTemp ?? planetData.temperature;
    setText(infoElements.temperature, formatTemperature(temperature));
}

async function populateImages(displayName) {
    const imagesSection = document.getElementById("planet-images");
    if (!imagesSection) return;
    imagesSection.textContent = "";

    try {
        const nasaItems = await getPlanetImages(displayName);
        const randomItems = selectRandomItems(nasaItems, 6);
        randomItems.forEach((item) => {
            const imageUrl = item?.links?.[0]?.href;
            const metadata = item?.data?.[0] ?? {};
            if (!imageUrl) return;

            const resource = buildFavoriteResource(metadata, imageUrl, displayName);
            const favoriteButton = createFavoriteToggle(resource, {
                isFavorite: isFavoriteByKey(RESOURCE_FAVORITES_KEY, resource.id),
                onToggle: (target) =>
                    toggleFavoriteByKey(RESOURCE_FAVORITES_KEY, target),
            });

            imagesSection.appendChild(
                createGalleryFigure({
                    src: imageUrl,
                    alt: `${displayName} NASA image`,
                    captionHtml: buildNasaCaption(metadata, displayName),
                    favoriteButton,
                })
            );
        });

        if (!imagesSection.hasChildNodes()) {
            imagesSection.appendChild(
                createStatusMessage("No imagery available right now.")
            );
        }
    } catch (error) {
        console.error("Failed to load NASA imagery", error);
        imagesSection.appendChild(
            createStatusMessage("NASA imagery is unavailable.")
        );
    }
}

function getHeroElements() {
    return {
        name: document.getElementById("planet-name"),
        heroImg: document.getElementById("planet-image"),
        heroSource: document.getElementById("planet-image-webp"),
        fullDescription: document.getElementById("planet-full-description"),
    };
}

function getInfoElements() {
    return {
        mass: document.getElementById("planet-mass"),
        radius: document.getElementById("planet-radius"),
        orbitalPeriod: document.getElementById("planet-orbital-period"),
        semiMajorAxis: document.getElementById("planet-semi-major-axis"),
        distance: document.getElementById("planet-distance"),
        temperature: document.getElementById("planet-temperature"),
    };
}


function displayError(message) {
    const heroName = document.getElementById("planet-name");
    const imagesSection = document.getElementById("planet-images");
    if (heroName) {
        heroName.textContent = message;
    }
    if (imagesSection) {
        imagesSection.textContent = "";
        imagesSection.appendChild(
            createStatusMessage("Please return to the previous page and try again.")
        );
    }
}
