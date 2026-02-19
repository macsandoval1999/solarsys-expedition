/* This file is the main entry point for the JavaScript code in the application. It imports necessary functions from the mainServices.mjs module and sets up event listeners for when the DOM content is loaded, when the page is shown, and when the custom "apodFavoriteUpdated" event is dispatched. These event listeners ensure that the appropriate functions are called to initialize the home page, handle page visibility changes, and update the favorite gallery when a user adds or removes an APOD from their favorites. */



import { handleApodFavoriteUpdated, handlePageShow, initHomePage } from "./mainServices.mjs";

window.addEventListener("DOMContentLoaded", initHomePage); // When DOM is fully loaded, we call the initHomePage function to set up the initial state of the home page, including fetching and displaying the APOD and any relevant welcome messages based on the user's visit history.

window.addEventListener("pageshow", handlePageShow); // When the page is shown, we call the handlePageShow function to handle any necessary actions related to page visibility changes, such as reloading the page if it was loaded from the bfcache.

document.addEventListener("apodFavoriteUpdated", handleApodFavoriteUpdated); // When the custom "apodFavoriteUpdated" event is dispatched, we call the handleApodFavoriteUpdated function to update the favorite gallery accordingly.

