/* This module defines the Planet class, which is responsible for creating and managing the visual representation of a planet in the solar system visualization. It handles the creation of the planet's DOM elements, applying styles and animations, and managing the tooltip that displays additional information about the planet. */



export class Planet {
    constructor(data) {
        this.data = data;
        this.element = document.createElement("div");
        this.tooltipLoaded = false;
    }

    render(container)
    /* This method creates the necessary DOM elements for the planet and appends them to the given container. It sets up the planet's appearance, including its size, position, and any special features like rings or retrograde rotation. It also manages the tooltip that displays additional information about the planet when hovered or focused. */{
        this.element.className = "planet";
        this.element.style.width = `${this.data.size}px`;
        this.element.style.height = `${this.data.size}px`;
        this.element.style.top = "50%";
        this.element.style.left = "100%";
        this.element.style.transform = "translate(-50%, -50%)";
        this.element.dataset.name = this.data.name.toLowerCase();
        this.element.setAttribute("role", "button"); // Set role to "button" for accessibility, indicating that this element is interactive and can be clicked or focused.
        this.element.setAttribute("aria-label", `Planet ${this.data.name}`);

        const planetSurfaceWrapper = document.createElement("div");
        planetSurfaceWrapper.className = "planet-surface-wrapper";

        const planetSurface = document.createElement("div");
        planetSurface.className = "planet-surface planet-spin";
        planetSurface.style.backgroundImage = `url(${this.data.imageSmall})`;
        planetSurface.style.animationDuration = `${this.getRotationDuration()}s`;

        if (this.isRetrograde()) { // Check if the planet has retrograde rotation (like Venus and Uranus) and apply the "spin-reverse" class to reverse the direction of the spin animation.
            planetSurface.classList.add("spin-reverse");
        }
        if (this.isRinged()) { // Check if the planet has rings (like Saturn) and apply the appropriate classes to style the rings.
            this.element.classList.add("planet--ringed");
            planetSurfaceWrapper.classList.add("planet-surface-wrapper--ringed");
            planetSurface.classList.add("planet-surface--ringed");
        }

        planetSurfaceWrapper.appendChild(planetSurface);
        this.element.appendChild(planetSurfaceWrapper);

        const planetTip = document.createElement("div"); // intro box for planets when hovered or focused
        planetTip.className = "planet-tip";
        document.body.appendChild(planetTip);
        let tooltipRafId = null; // Variable to store the requestAnimationFrame ID for updating the tooltip position.

        const updateTooltipPosition = () =>
        /* This function updates the position of the tooltip based on the planet's position on the screen. It uses requestAnimationFrame to continuously update the position while the tooltip is visible. */{
            if (!planetTip.classList.contains("is-visible")) return;
            const rect = this.element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const topY = rect.top;
            planetTip.style.left = `${centerX}px`;
            planetTip.style.top = `${topY}px`;
            planetTip.style.bottom = "auto";
            planetTip.style.transform = "translate(-50%, calc(-100% - 12px))";
            tooltipRafId = requestAnimationFrame(updateTooltipPosition); // Continuously update the tooltip position while it is visible.
        };

        const showTooltip = () =>
        /* This function shows the tooltip when the planet is hovered or focused. It sets the content of the tooltip if it hasn't been loaded yet and starts updating its position. */{
            planetTip.classList.add("is-visible");
            if (!this.tooltipLoaded) {
                planetTip.innerHTML = this.buildTooltipContent();
                this.tooltipLoaded = true;
            }
            planetTip.style.position = "fixed";
            updateTooltipPosition(); // Start updating the tooltip position when it is shown.
        };

        const hideTooltip = () =>
        /* This function hides the tooltip when the planet is no longer hovered or focused. It stops updating the tooltip position and hides the tooltip. */{
            planetTip.classList.remove("is-visible");
            if (tooltipRafId) {
                cancelAnimationFrame(tooltipRafId); // Stop updating the tooltip position when it is hidden. cancelAnimationFrame is a built-in function that cancels a scheduled animation frame request, preventing the callback function from being called.
                tooltipRafId = null; // Reset the tooltipRafId variable to null after canceling the animation frame request.
            }
        };

        /* Add event listeners for mouseenter, focusin, mouseleave, and focusout to show and hide the tooltip appropriately when the planet is interacted with. This ensures that the tooltip is accessible both with mouse and keyboard interactions. */
        this.element.addEventListener("mouseenter", showTooltip);
        this.element.addEventListener("focusin", showTooltip);
        this.element.addEventListener("mouseleave", hideTooltip);
        this.element.addEventListener("focusout", hideTooltip);

        container.appendChild(this.element);
    }

    getRotationDuration()
    /* This function calculates the rotation duration of the planet based on its rotation speed. It returns a default value if the rotation speed is not available or invalid. */ {
        const rotationSpeed = Number(this.data.rotationSpeed);
        if (!rotationSpeed || Number.isNaN(rotationSpeed)) return 60;
        return Math.max(15, 1 / rotationSpeed);
    }

    isRetrograde()
    /* This function checks if the planet has a retrograde rotation. It returns true for Venus and Uranus, which are known to have retrograde rotation. */
    {
        const name = this.data.name.toLowerCase();
        return name === "venus" || name === "uranus";
    }

    isRinged()
    /* This function checks if the planet has rings. It returns true for Saturn, which is known to have prominent rings. */
    {
        return this.data.name.toLowerCase() === "saturn";
    }

    buildTooltipContent() /* This function builds the content of the tooltip for the planet. It returns an HTML string with the planet's name and a short description.
    */ {
        const title = this.data?.name ?? "Planet"; // check if the planet's name is available in the data, and use it as the title for the tooltip. If the name is not available, it defaults to "Planet".
        const description = this.data?.smallDescription ?? "Description unavailable.";
        return `
            <div class="planet-tip__title">${title}</div>
            <div class="planet-tip__description">${description}</div>
        `;
    }

}
