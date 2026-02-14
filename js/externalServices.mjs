import { fetchPlanetData } from "./api/ninjaPlanetsApi.mjs";

export default class ExternalServices {
    async getPlanet(name) {
        return fetchPlanetData(name);
    }
}