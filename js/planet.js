import ExternalServices from "./externalServices.mjs";

const services = new ExternalServices();

export class Planet {
    constructor(data) {
        this.data = data;
        this.element = document.createElement("div");
        this.tooltipLoaded = false;
    }

    render(container) {
        this.element.className = "planet";
        this.element.style.width = `${this.data.size}px`;
        this.element.style.height = `${this.data.size}px`;
        this.element.style.top = "50%";
        this.element.style.left = "100%";
        this.element.style.transform = "translate(-50%, -50%)";
        this.element.dataset.name = this.data.name.toLowerCase();
        this.element.setAttribute("role", "button");
        this.element.setAttribute("aria-label", `Planet ${this.data.name}`);

        const planetSurfaceWrapper = document.createElement("div");
        planetSurfaceWrapper.className = "planet-surface-wrapper";

        const planetSurface = document.createElement("div");
        planetSurface.className = "planet-surface planet-spin";
        planetSurface.style.backgroundImage = `url(${this.data.imageSmall})`;
        planetSurface.style.animationDuration = `${this.getRotationDuration()}s`;
        if (this.isRetrograde()) {
            planetSurface.classList.add("spin-reverse");
        }
        if (this.isRinged()) {
            this.element.classList.add("planet--ringed");
            planetSurfaceWrapper.classList.add("planet-surface-wrapper--ringed");
            planetSurface.classList.add("planet-surface--ringed");
        }
        planetSurfaceWrapper.appendChild(planetSurface);
        this.element.appendChild(planetSurfaceWrapper);

        const tooltip = document.createElement("div");
        tooltip.className = "planet-tooltip";
        tooltip.textContent = `Loading ${this.data.name}...`;
        this.element.appendChild(tooltip);

        const showTooltip = async () => {
            tooltip.classList.add("is-visible");
            if (this.tooltipLoaded) return;
            try {
                const planetData = await services.getPlanet(
                    this.data.name.toLowerCase()
                );
                tooltip.innerHTML = this.buildTooltipContent(planetData);
                this.tooltipLoaded = true;
            } catch {
                tooltip.textContent = `${this.data.name} data unavailable`;
            }
        };

        const hideTooltip = () => {
            tooltip.classList.remove("is-visible");
        };

        this.element.addEventListener("mouseenter", showTooltip);
        this.element.addEventListener("focusin", showTooltip);
        this.element.addEventListener("mouseleave", hideTooltip);
        this.element.addEventListener("focusout", hideTooltip);

        container.appendChild(this.element);
    }

    getRotationDuration() {
        const rotationSpeed = Number(this.data.rotationSpeed);
        if (!rotationSpeed || Number.isNaN(rotationSpeed)) return 60;
        return Math.max(15, 1 / rotationSpeed);
    }

    isRetrograde() {
        const name = this.data.name.toLowerCase();
        return name === "venus" || name === "uranus";
    }

    isRinged() {
        return this.data.name.toLowerCase() === "saturn";
    }

    buildTooltipContent(data) {
        const semimajorAxis = this.formatDistance(
            data?.semimajorAxis ?? data?.semi_major_axis
        );
        const perihelion = this.formatDistance(data?.perihelion);
        const aphelion = this.formatDistance(data?.aphelion);
        const radius = this.formatDistance(data?.radius);
        const mass = data?.mass ?? null;

        return `
            <div class="planet-tooltip__title">${data?.englishName ?? data?.name ?? this.data.name}</div>
            <div class="planet-tooltip__row">Semimajor axis: ${semimajorAxis}</div>
            <div class="planet-tooltip__row">Perihelion: ${perihelion}</div>
            <div class="planet-tooltip__row">Aphelion: ${aphelion}</div>
            <div class="planet-tooltip__row">Radius: ${radius}</div>
            <div class="planet-tooltip__row">Mass: ${mass ?? "n/a"}</div>
        `;
    }

    formatDistance(value) {
        if (!value && value !== 0) return "n/a";
        return `${Number(value).toLocaleString()} km`;
    }

}
