import { initSolarSystem } from "./solarSystem.mjs";
import { loadPageMutuals } from "./utils.mjs";

window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});

initSolarSystem();
loadPageMutuals();