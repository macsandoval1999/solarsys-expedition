/* This module contains services and functions specific to the planet detail page of the solar system explorer website. It includes functions for initializing the planet page, updating the hero section with planet information, populating data cards with planetary details, and fetching and displaying images related to the planet from NASA's API. The module also handles error cases and provides utility functions for managing favorites and formatting planetary data. It imports necessary functions from other modules to perform these tasks effectively. */



import { isFavoriteByKey, createStatusMessage, loadPageMutuals, setHtml, setText, toggleFavoriteByKey } from "./utils.mjs";
import { buildNasaCaption, createFavoriteToggle, createGalleryFigure } from "./cardBuilder.mjs";
import { buildFavoriteResource, findPlanetConfig, formatDistanceFromEarth, formatMass, formatPeriod, formatRadius, formatSemiMajorAxis, formatTemperature, getPlanetData, getPlanetImages, resolveAssetPath, selectRandomItems, toTitleCase } from "./dataStuff.mjs";
import { loadPlanetsConfig } from "./solarSystem.mjs";



const RESOURCE_FAVORITES_KEY = "favoriteResources";



export async function initPlanetPage()
/* Initializes planet page with everything needed to display planet details. Calls functions to load mutual elements, fetch planet data, and populate the page with relevant information. */
{
    await loadPageMutuals();
    const planetQuery = new URLSearchParams(window.location.search).get("planet"); // Get the planet query parameter from the URL
    
    if (!planetQuery) { // If there is no planet query parameter, we cannot load the planet details, so we display an error message to the user and return early from the function. 
        displayError("No planet selected.");
        return;
    }

    try {
        const [planetData, planetsConfig] = await Promise.all([getPlanetData(planetQuery), loadPlanetsConfig()]);

        const displayName = planetData.englishName ?? planetData.name ?? toTitleCase(planetQuery); 
        updateHero(displayName, planetsConfig, planetQuery);
        populateDataCards(planetData);
        await populateImages(displayName);
    } catch (error) {
        console.error("Failed to load planet details", error);
        displayError("Unable to load planet details right now.");
    }
}




function updateHero(displayName, planetsConfig, planetQuery)
/* This function updates the hero section of the planet page with the planet's name, description, and image. It takes the display name of the planet, the planets configuration data, and the original planet query as arguments. It finds the relevant planet configuration based on the query, updates the hero section with the planet's information, and sets the appropriate image for the hero section. If the planet is Saturn, it also applies a special class to style the hero section accordingly. 
parameters: 
    - displayName: The display name of the planet.
    - planetsConfig: The configuration data for all planets.
    - planetQuery: The original query parameter for the planet.
*/{
    const heroElements = getHeroElements();
    const heroSection = document.getElementById("planet-hero");
    if (heroElements.name) {
        heroElements.name.textContent = displayName;
    }

    if (heroSection) {
        const isSaturn = displayName.toLowerCase() === "saturn";
        heroSection.classList.toggle("planet-hero-saturn", isSaturn); // Due to saturns rings, we couldnt use the same style as the others as it assumes the image is a circle. Saturns image is wider and has rings, so we have to style it differently.
    }

    const planetConfig = findPlanetConfig(planetsConfig, planetQuery);
    setHtml(heroElements.fullDescription, planetConfig?.fullDescription ?? planetConfig?.smallDescription);
    
    const preferredImage = resolveAssetPath(planetConfig?.imageMed ?? planetConfig?.imageSmall); // We try to use the medium image as the preferred image for the hero section, and if that's not available, we fall back to the small image.
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



function populateDataCards(planetData)
/* This function populates the data cards on the planet page with the relevant information about the planet. It takes planet data and populates the data cards accordingly. */{
    const infoElements = getInfoElements();
    setText(infoElements.mass, formatMass(planetData.mass));
    const radiusValue = planetData.meanRadius ?? planetData.radius ?? planetData.equaRadius;
    setText(infoElements.radius, formatRadius(radiusValue));

    const orbitalPeriod =
        planetData.sideralOrbit ?? // check if sideralOrbit is available in the planet data and use it if exists...
        planetData.orbital_period ?? // ...otherwise, check if orbital_period is available and use it if exists...
        planetData.orbitalPeriod ?? // ...otherwise, check if orbitalPeriod is available and use it if exists...
        planetData.period; // ...otherwise, check if period is available and use it if exists. This way we can handle different possible property names for the orbital period across different data sources.
    
    setText(infoElements.orbitalPeriod, formatPeriod(orbitalPeriod));

    setText(infoElements.semiMajorAxis, formatSemiMajorAxis(planetData));
    setText(infoElements.distance, formatDistanceFromEarth(planetData));

    const temperature = planetData.avgTemp ?? planetData.temperature;
    setText(infoElements.temperature, formatTemperature(temperature));
}



async function populateImages(displayName)
/* Populates gallery section with images related to a planet from NASAs API.
parameters:
    - displayName: The display name of the planet, used to search for relevant images in NASA's API. */
{
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



function getHeroElements()
/* Get hero elements from the DOM, used in planet page. These are the elements that display the planet's name, hero image, and full description. */
{
    return {
        name: document.getElementById("planet-name"),
        heroImg: document.getElementById("planet-image"),
        heroSource: document.getElementById("planet-image-webp"),
        fullDescription: document.getElementById("planet-full-description"),
    };
}



function getInfoElements()
/* Get info elements from the DOM, used in planet page. These are the elements that display the planet's information such as mass, radius, orbital period, etc. */
{
    return {
        mass: document.getElementById("planet-mass"),
        radius: document.getElementById("planet-radius"),
        orbitalPeriod: document.getElementById("planet-orbital-period"),
        semiMajorAxis: document.getElementById("planet-semi-major-axis"),
        distance: document.getElementById("planet-distance"),
        temperature: document.getElementById("planet-temperature"),
    };
}



function displayError(message)
/* Display an error message on the planet page. This function is called when there is an error loading the planet details, and it updates the hero section and images section to show the error message to the user. */{
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
