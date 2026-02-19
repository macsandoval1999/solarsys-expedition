/* This file is responsible for initializing the planet page by setting up event listeners and calling the necessary functions to populate the page with the planet's details and images. It imports the initPlanetPage function from the planetPageServices module, which contains the logic for fetching and displaying the planet's information. When the DOM content is fully loaded, it calls initPlanetPage to start the process of loading the planet's data and updating the page accordingly. */



import { initPlanetPage } from "./planetPageServices.mjs";

window.addEventListener("DOMContentLoaded", initPlanetPage); // when dom content is loaded, we initialize the planet page by calling the initPlanetPage function, which will handle fetching the planet data, updating the hero section, populating the data cards, and fetching and displaying images related to the planet from NASA's API. This ensures that all the necessary information about the planet is loaded and displayed to the user when they visit the planet detail page.
