import { initSolarSystem } from "./solarSystem.mjs";
import { createStars, loadHeaderFooter } from "./utils.mjs";

document.addEventListener("DOMContentLoaded", async () => {
    createStars();
    await initSolarSystem();
    loadHeaderFooter();
});
