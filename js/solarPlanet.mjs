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
        tooltip.style.display = "none";
        document.body.appendChild(tooltip);
        let tooltipRafId = null;

        const updateTooltipPosition = () => {
            if (!tooltip.classList.contains("is-visible")) return;
            const rect = this.element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const topY = rect.top;
            tooltip.style.left = `${centerX}px`;
            tooltip.style.top = `${topY}px`;
            tooltip.style.bottom = "auto";
            tooltip.style.transform = "translate(-50%, calc(-100% - 12px))";
            tooltipRafId = requestAnimationFrame(updateTooltipPosition);
        };

        const showTooltip = () => {
            tooltip.classList.add("is-visible");
            if (!this.tooltipLoaded) {
                tooltip.innerHTML = this.buildTooltipContent();
                this.tooltipLoaded = true;
            }
            tooltip.style.position = "fixed";
            tooltip.style.display = "block";
            updateTooltipPosition();
        };

        const hideTooltip = () => {
            tooltip.classList.remove("is-visible");
            tooltip.style.display = "none";
            if (tooltipRafId) {
                cancelAnimationFrame(tooltipRafId);
                tooltipRafId = null;
            }
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

    buildTooltipContent() {
        const title = this.data?.name ?? "Planet";
        const description = this.data?.smallDescription ?? "Description unavailable.";
        return `
            <div class="planet-tooltip__title">${title}</div>
            <div class="planet-tooltip__row">${description}</div>
        `;
    }

}
