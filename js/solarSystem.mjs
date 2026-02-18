/* This module is responsible for initializing the solar system visualization on the page. It loads the planet configuration data from a JSON file, creates the necessary DOM elements for each planet and its orbit, and applies the appropriate styles and animations to create a dynamic representation of the solar system. The planets are rendered using the Planet class, which is imported from the solarPlanet.mjs module. */



import { Planet } from "./solarPlanet.mjs";



export async function loadPlanetsConfig()
/* This function loads the planet configuration data from the specified JSON file. It fetches the data, parses it as JSON, and returns an array of planet objects. After extensive research, I couldn't find an api that had the information I felt was also needed about the planets. I created a JSON file with that data.*/{
    const response = await fetch(new URL("../assets/json/planets.json", import.meta.url));
    const data = await response.json();
    return Object.values(data); // We return the values of the data object as an array, since the JSON file is structured as an object with planet names as keys and their respective data as values. By using Object.values, we can easily get an array of planet objects that we can then use to create our solar system visualization.
}



export async function initSolarSystem()
/* This function initializes the solar system visualization on the page. It loads the planet configuration data, creates the necessary DOM elements for each planet and its orbit, and applies the appropriate styles and animations to create a dynamic representation of the solar system. 
imports: loadPlanetsConfig from ./solarSystem.mjs, Planet from ./solarPlanet.mjs
*/{
    const system = document.getElementById("solar-system");
    const planets = await loadPlanetsConfig(); // Load the planet configuration data from the JSON file. This will give us an array of planet objects with their respective data, such as name, distance from the sun, and other properties that we can use to create the visualization. This function uses the json file mentioned in the loadPlanetsConfig declaration.

    const nowSeconds = Date.now() / 1000; // Current time in seconds, used for calculating the animation delay for each planet's orbit to create a dynamic effect where the planets are at different positions in their orbits when the page loads. This is better than having them all start at the same position, which would look less natural.

    planets.forEach((planetData) => {
        const orbit = document.createElement("div");
        orbit.className = "orbit";
        orbit.style.width = `${planetData.distance * 2}px`;
        orbit.style.height = `${planetData.distance * 2}px`;
        orbit.style.top = "50%";
        orbit.style.left = "50%";
        orbit.style.transform = "translate(-50%, -50%)";

        const orbitSpinner = document.createElement("div");
        orbitSpinner.className = "orbit-rotation rotate";
        const orbitDuration = Number(planetData.distance);
        orbitSpinner.style.animationDuration = `${orbitDuration}s`;
        if (orbitDuration) {
            const phaseOffset = nowSeconds % orbitDuration; // Calculate the phase offset based on the current time and the orbit duration. This will give us a value between 0 and the orbit duration, which we can use to set the animation delay for the orbit rotation. By using the modulus operator, we ensure that the phase offset loops back to 0 after reaching the orbit duration, creating a continuous animation effect.
            orbitSpinner.style.animationDelay = `-${phaseOffset}s`; // Set the animation delay to the negative of the phase offset, which will effectively start the animation at the correct position in the orbit based on the current time. This way, when the page loads, each planet will be at a different position in its orbit, creating a more dynamic and natural-looking solar system visualization.
        }

        const planet = new Planet(planetData);
        planet.render(orbitSpinner); // render is a method in the Planet class that creates the necessary DOM elements for the planet and appends them to the given container (in this case, the orbitSpinner). This will create the visual representation of the planet within its orbit.

        orbit.appendChild(orbitSpinner); // Append the orbitSpinner (which contains the planet) to the orbit element. This will position the planet within its orbit and allow it to rotate around the sun based on the animation defined in the CSS for the "rotate" class.

        system.appendChild(orbit); // Finally, append the orbit (which contains the orbitSpinner and the planet) to the main solar system container in the DOM. This will add the planet and its orbit to the overall solar system visualization on the page.
    });
}
