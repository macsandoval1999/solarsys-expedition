/* This file contains various functions for fetching, processing, and formatting data related to NASA's APOD and planet information. It includes functions for caching data in local storage, building favorite item objects, and formatting various types of data for display. These functions are used throughout the application to manage data retrieval and presentation in a consistent way. By centralizing these data-related functions in one module, we can keep our code organized and make it easier to maintain and update as needed. */



import { fetchApod, fetchPlanetImages } from "./api/nasaApi.mjs";
import { fetchPlanetData } from "./api/ninjaPlanetsApi.mjs";
import { loadPlanetsConfig } from "./solarSystem.mjs";
import { getLocalStorage, setLocalStorage } from "./utils.mjs";



/*****************************************************************************************************/
// Constants and configuration ************************************************************************
/*****************************************************************************************************/

const APOD_ARCHIVE_BASE = "https://apod.nasa.gov/apod/ap"; // Base URL for APOD archive pages, which are structured as "apYYMMDD.html. Needed to build links to specific APOD entries based on their date. We later append the date in YYMMDD format to this base URL to create the full link to the APOD archive page for that date that users can click on to view the APOD entry on the official NASA APOD website."

const NINJA_PLANETS_STORAGE_KEY = "planetData"; // This is the key where any fetched planet data from Ninja Planets API will be stored in local storage.

const JUPITER_MASS_KG = 1.898e27; // /* In the ninja api, they measure planets with Jupiters... Need this to convert data to standard units. This value is the mass of Jupiter in kilograms. */

const JUPITER_RADIUS_KM = 69911; // /* This value is the radius of Jupiter in kilometers. */



/*******************************************************************************************************
 Helper functions for formatting and caching data *****************************************************/
/*****************************************************************************************************/

function getCachedNinjaPlanets()
/* This function retrieves cached planet data from local storage. If the data is not found or is invalid, it returns null. */
//imports: getLocalStorage from utils.mjs
//constants: NINJA_PLANETS_STORAGE_KEY - The key under which the planet data is stored in local storage.
{
    const stored = getLocalStorage(NINJA_PLANETS_STORAGE_KEY);
    if (stored && typeof stored === "object") {
        return stored;
    }
    return null;
}



function setCachedNinjaPlanets(cache)
/* This function stores planet data in local storage.
parameter: cache - The planet data to be stored in local storage.
imports: setLocalStorage from utils.mjs
constants: NINJA_PLANETS_STORAGE_KEY - The key under which the planet data will be stored in local storage.
*/
{
    setLocalStorage(NINJA_PLANETS_STORAGE_KEY, cache);
}



/*******************************************************************************************************
/* APOD Data ******************************************************************************************/
/*******************************************************************************************************/
export async function getApodData()
/* This does the exact same thing as fetchApod. Its only here for future flexibility so I dont have to mess with the actual API fetcher 
imports: fetchApod from ./api/nasaApi.mjs
*/ {
    return fetchApod();
}



export function buildApodArchiveUrl(date)
/* This function builds the URL for a specific APOD archive page based on the provided date. This is used for creating the links to the official NASA APOD Website for each APOD entry.
Parameter: date - The date of the APOD entry in the format "YYYY-MM-DD".
constants: APOD_ARCHIVE_BASE - The base URL for APOD archive pages.
Returns: The URL of the APOD archive page for the given date.

*/ {
    if (!date) return "https://apod.nasa.gov/apod/"; // if no date, link will be to the main APOD page.

    // if date is provided, we need to convert it from "YYYY-MM-DD" format to "apYYMMDD.html" format to build the correct URL
    const [year, month, day] = date.split("-"); 

    // If any of the date components are missing or invalid, we return the main APOD page URL as a fallback.
    if (!year || !month || !day) return "https://apod.nasa.gov/apod/";

    // format the year to get the last two digits, since the archive URLs use a two-digit year format. Example: if year is "2024", shortYear will be "24".
    const shortYear = year.slice(-2);

    return `${APOD_ARCHIVE_BASE}${shortYear}${month}${day}.html`; // Return the full URL for the APOD archive page for the given date. Example: if date is "2024-06-15", the returned URL will be "https://apod.nasa.gov/apod/ap240615.html".
}



export function buildApodFavorite(apod, title, date, mediaType, mediaUrl, thumbnailUrl, archiveUrl)
/* This function builds a favorite item object for an APOD entry. It takes various parameters related to the APOD entry and returns an object representing the favorite item. 
parameters:
- apod: The APOD data object.
- title: The title of the APOD entry.
- date: The date of the APOD entry.
- mediaType: The type of media (image or video).
- mediaUrl: The URL of the media.
- thumbnailUrl: The URL of the thumbnail (for videos).
- archiveUrl: The URL of the APOD archive page.
returns: An object representing the favorite item.
*/
{
    const imageUrl = mediaType === "video" ? (thumbnailUrl || mediaUrl) : mediaUrl;
    const idSource = date || apod?.url || title;
    return {
        id: `apod-${idSource}`,
        title: title ?? "NASA Picture of the Day", // NASA Picture of the Day is the default title if none provided
        date: date ?? "", // blank if none provided
        imageUrl,
        archiveUrl,
        type: "apod",
    };
}



export function buildFavoriteResource(metadata, imageUrl, displayName) 
/* This function builds a favorite item object for a NASA resource. It takes various parameters related to the resource and returns an object representing the favorite item.
parameters:
- metadata: The metadata object for the resource.
- imageUrl: The URL of the resource image.
- displayName: The display name of the resource.
returns: An object representing the favorite item.
*/ {
    const id = metadata?.nasa_id ?? imageUrl; // check if the metadata has a nasa_id property to use as the id for the favorite item. If not, we fall back to using the imageUrl as the id.
    return {
        id,
        title: metadata?.title ?? `${displayName} NASA image`,
        dateCreated: metadata?.date_created ?? null,
        secondaryCreator: metadata?.secondary_creator ?? null,
        imageUrl,
        planet: displayName,
    };
}



/***************************************************************************************************************/
/* Ninja Planets Data ******************************************************************************************/
/***************************************************************************************************************/
export async function getPlanetData(query)
/* This function fetches planet data from the Ninja Planets API. It first checks the local storage for the requested planet data. If the data is not found in the cache, it fetches the data from the API and updates the cache. 
Parameter: query - The name of the planet to fetch data for.
imports: fetchPlanetData from ./api/ninjaPlanetsApi.mjs
helpers: getCachedNinjaPlanets, setCachedNinjaPlanets
*/ {
    const cache = getCachedNinjaPlanets(); // create a cache variable to hold the cached planet data from local storage.

    const normalized = typeof query === "string" ? query.toLowerCase() : ""; // Check if the passed query variable is a string, if so convert it to lowercase. If not, set it to an empty string.
    if (!normalized) { // If normalized is empty (meaning a string query wasnt passed) do the following...
        return fetchPlanetData(query); // fetch the planet data using the query.
    }

    if (cache?.[normalized]) { // Check if the cache exists and has a property matching the normalized query. At this point if the query is a valid planet name, it will check if its in cache. Example: cache["earth"] or cache["mars"].
        return cache[normalized]; // If the cache has the requested planet data, return it.
    }

    // If the requested planet data is not in the cache, we continue the rest of the function below.
    const fetched = await fetchPlanetData(query); // Create a variable to hold the fetched planet data from the API using the query.
    if (fetched) { // If fetched exists, the fetch was successful and we can do the following...
        const nextCache = cache ? { ...cache } : {}; // Check if the cache exists, if so create a shallow copy of it to avoid mutating the original cache object. If the cache does not exist, initialize nextCache as an empty object.
        nextCache[normalized] = fetched; // Ex: nextCache["earth"] = { ...planet data for earth... }. Here we add the newly fetched planet data to the nextCache object under a property named after the normalized query (which is the planet name in lowercase).
        setCachedNinjaPlanets(nextCache); // We then set the newly updated cache (nextCache) in local storage using the setCachedNinjaPlanets function, so that it can be accessed quickly in the future without needing to make another API call for the same planet.
    }
    return fetched; // Finally, we return the fetched planet data. This will be the data that was just fetched from the API, since if it was in the cache we would have returned it earlier in the function.
}



export async function getPlanetImages(name)
/* Like getApod, this is the same as fetchPlanetImages, but its here for future flexibility so I dont have to mess with the actual API fetcher if I want to implement any additional logic related to fetching planet images in the future. 
Parameter: name - The name of the planet to fetch images for.
imports: fetchPlanetImages from ./api/nasaApi.mjs
*/ {
    return fetchPlanetImages(name);
}



export async function preloadNinjaPlanetsData()
/* This function preloads planet data from the Ninja Planets API and stores it in local storage for quick access. 
imports: fetchPlanetData from ./api/ninjaPlanetsApi.mjs, loadPlanetsConfig from ./solarSystem.mjs
helpers: getCachedNinjaPlanets, setCachedNinjaPlanets
*/ {
    const cache = getCachedNinjaPlanets(); // Create a variable to hold the cached planet data from local storage.
    
    // Path 1 - If we have preloaded data available, we return it and skip the rest of the function...
    if (cache && Object.keys(cache).length)  // If cache exists, and the cache has at least one property (meaning it has some planet data in it)...
        return cache; //  we return the cache and skip the rest of the function since we already have preloaded data available.

    //Path 2 - If we dont have preloaded data available, we continue with the rest of the function below...
    // If we dont have preloaded data available, we continue with the rest of the function below...
    const planets = await loadPlanetsConfig(); // Create a variable to hold the planets configuration data loaded from the planets.json file using the loadPlanetsConfig function. This data includes basic information about each planet, such as its name, which we will use to fetch the detailed planet data from the Ninja Planets API. We need to load this configuration first to get the list of planet names that we want to preload data for.

    const names = planets.map((planet) => planet?.name) // Create a variable to hold an array of planet names extracted from the planets variable, where we map over each planet and return its name property. ?.name prevents errors in case one of the planets doesnt have a name property for some reason. Those entries will just be undefined in the resulting names array.
        .filter((name) => typeof name === "string" && name.trim().length > 0); // We then filter the resulting array of planet names to include only entries that are strings and have at least one non-whitespace character after trimming.

    const results = await Promise.all( /* create a variable to hold the results of fetching planet data for each planet name using the fetchPlanetData function.
    Promise.all is used to run all the fetch operations concurrently and wait for all of them to complete. The following fetches will run at the same time: */

        names.map(async (name) => { // map over the names array, and for each name, we perform an asynchronous operation to fetch the planet data.
            try {
                const data = await fetchPlanetData(name); // fetch the planet data for the current name using the fetchPlanetData function...
                return [name.toLowerCase(), data]; // and return an array containing the lowercase version of the planet name and the fetched data. 
            } catch (error) {
                console.warn("Failed to preload planet data", name, error);
                return null;
            }
        })
    );

    // /* Now we a full data pair array in the results variable. Example: [ ["earth", { ...earth data... }], ["mars", { ...mars data... }], ... ]. We then reduce this array into an object where each property is a planet name and its value is the corresponding planet data. This will be our new cache object that we store in local storage. 
    const nextCache = results.reduce((updatedData, entry) => {  
        if (!entry)// If the entry is null (which means the fetch for that planet data failed), we skip it and return the accumulated storedPlanetData so far without modifying it.
            return updatedData; 
        
        // if the entry is valid, continue...
        const [key, value] = entry; // We destructure the entry array into key and value variables, where key is the lowercase planet name and value is the corresponding planet data. example: if entry is ["earth", { ...earth data... }], then key will be "earth" and value will be { ...earth data... }.

        if (value) { //if value exists...
            updatedData[key] = value; // we add a new property to the updatedData object with the name of the planet (key) and its corresponding data (value). example: updatedData["earth"] = { ...earth data... }.
        }
        return updatedData; // return the updatedData object, which will be used as the accumulated value for the next iteration of the reduce function. After the reduce function has processed all entries in the results array, nextCache will be an object containing all the successfully fetched planet data, keyed by lowercase planet names. example: { earth: { ...earth data... }, mars: { ...mars data... }, ... }.
    }, {});

    setCachedNinjaPlanets(nextCache); // Store the updated cache object (nextCache) in local storage using the setCachedNinjaPlanets function

    return nextCache; // Finally, we return the nextCache object, which contains all the preloaded planet data that we just fetched and stored in local storage. This allows us to have quick access to this data in the future without needing to make additional API calls for the same planets.
}





/*******************************************************************************************************/
/* Utility functions for processing and formatting data **************************************************/
/*******************************************************************************************************/
export function selectRandomItems(items, count) {
    if (!Array.isArray(items) || items.length === 0 || count <= 0) return [];
    const pool = items.slice();
    const selection = [];
    while (pool.length && selection.length < count) {
        const index = Math.floor(Math.random() * pool.length);
        selection.push(pool.splice(index, 1)[0]);
    }
    return selection;
}



export function findPlanetConfig(planetsConfig, query)
/* This function searches for a planet configuration object within an array of planet configurations based on a query string.
parameters:
- planetsConfig: An array of planet configuration objects.
- query: The name of the planet to search for.
returns: The matching planet configuration object, or null if not found.
-used in: planetPageServices.mjs when we need to find the configuration for a specific planet based on its name. Example: if we have an array of planet configurations and we want to find the configuration for "Earth", we can call findPlanetConfig(planetsConfig, "Earth") and it will return the configuration object for Earth if it exists in the planetsConfig array, or null if it does not exist. This is useful for retrieving additional information about the planet that may be stored in the configuration, such as its display name, description, or other metadata that we may want to use when displaying the planet's information on its page.
*/{
    if (!Array.isArray(planetsConfig) || !query) return null;
    const target = query.toLowerCase();
    return planetsConfig.find((planet) => planet.name?.toLowerCase() === target) ?? null;
}



export function resolveAssetPath(path)
/* Had issues loading assets prior to this on a live server. This function resolves the asset path for a given resource. It takes a path string as input and returns the resolved path.
parameters:
- path: The path string to resolve.
returns: The resolved path string.
-used in: planetPageServices.mjs when we need to resolve the path for a planet image or other asset. This function helps ensure that the correct path is used to load assets, especially when the application is deployed on a live server where relative paths may not work as expected. By using this function, we can avoid issues with loading assets and ensure that they are correctly resolved regardless of the deployment environment. Example: if we have an image asset located at "assets/images/earth.jpg", we can call resolveAssetPath("assets/images/earth.jpg") to get the correct path to use for loading that image in our application.
*/{
    if (!path) return "";
    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) return path.slice(1);
    return path;
}



/*******************************************************************************************************/
/* Formatting Functions *********************************************************************************/
/*******************************************************************************************************/
export function formatMass(rawMass) {
    if (rawMass == null) return "n/a";
    const massJupiters = Number(rawMass);
    if (Number.isNaN(massJupiters)) return "n/a";

    const massKg = massJupiters * JUPITER_MASS_KG;
    const massLbs = massKg * 2.20462;

    const kg = massKg.toExponential(2);
    const lbs = massLbs.toExponential(2);
    return `${kg}kg or ${lbs}lbs`;
}

export function formatRadius(valueKm) {
    if (valueKm == null) return "n/a";
    const radiusJupiters = Number(valueKm);
    if (Number.isNaN(radiusJupiters)) return `${valueKm}`;

    const kmNumber = radiusJupiters * JUPITER_RADIUS_KM;
    if (Number.isNaN(kmNumber)) return `${valueKm}`;
    const km = kmNumber.toFixed(2);
    const miles = (kmNumber * 0.621371).toFixed(2);
    return `${km}km or ${miles}mi`;
}

export function formatKilometers(value) {
    if (value == null) return "n/a";
    const number = Number(value);
    if (Number.isNaN(number)) return `${value}`;
    return `${number.toLocaleString()} km`;
}

export function formatPeriod(value) {
    if (value == null) return "n/a";
    const number = Number(value);
    if (Number.isNaN(number)) return `${value}`;
    return `${number.toLocaleString(undefined, { maximumFractionDigits: 1 })} Earth days`;
}

export function formatSemiMajorAxis(data) {
    if (!data) return "n/a";
    if (data.semimajorAxis != null) {
        return formatKilometers(data.semimajorAxis);
    }
    if (data.semi_major_axis != null) {
        const number = Number(data.semi_major_axis);
        if (Number.isNaN(number)) return `${data.semi_major_axis}`;
        return `${number.toLocaleString(undefined, { maximumFractionDigits: 3 })} AU`;
    }
    return "n/a";
}

export function formatDistanceFromEarth(data) {
    if (!data) return "n/a";
    if (data.distanceFromEarth != null) {
        return formatKilometers(data.distanceFromEarth);
    }
    if (data.distance_light_year != null) {
        const number = Number(data.distance_light_year);
        if (!Number.isNaN(number)) {
            return `${number.toLocaleString(undefined, {
                minimumFractionDigits: 6,
                maximumFractionDigits: 6,
            })} ly`;
        }
        return `${data.distance_light_year}`;
    }
    if (data.aphelion != null && data.perihelion != null) {
        return `${formatKilometers(data.perihelion)} - ${formatKilometers(data.aphelion)}`;
    }
    return "n/a";
}

export function formatTemperature(value) {
    if (value == null) return "n/a";
    const number = Number(value);
    if (Number.isNaN(number)) return `${value}`;
    const kelvin = number;
    const fahrenheit = (kelvin - 273.15) * (9 / 5) + 32;
    const kText = kelvin.toLocaleString(undefined, { maximumFractionDigits: 0 });
    const fText = fahrenheit.toLocaleString(undefined, { maximumFractionDigits: 1 });
    return `${kText} K or ${fText} °F`;
}

export function toTitleCase(value) {
    if (!value) return "";
    return value
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}