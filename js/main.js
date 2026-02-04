import { initSolarSystem } from "./solarSystem.mjs";
import { createStars } from "./utils.mjs";

document.addEventListener("DOMContentLoaded", () => {
    createStars();
    initSolarSystem();
});
