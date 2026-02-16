import {
    handleApodFavoriteUpdated,
    handlePageShow,
    initHomePage,
} from "./mainServices.mjs";

window.addEventListener("DOMContentLoaded", initHomePage);
window.addEventListener("pageshow", handlePageShow);
document.addEventListener("apodFavoriteUpdated", handleApodFavoriteUpdated);

