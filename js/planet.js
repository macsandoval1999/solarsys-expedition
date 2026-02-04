import { routeToPlanet } from "./router.js";

export class Planet {
    constructor(data) {
        this.data = data;
        this.element = document.createElement("div");
    }

    render(container) {
        this.element.className = "planet";
        this.element.style.width = `${this.data.size}px`;
        this.element.style.height = `${this.data.size}px`;
        this.element.style.backgroundImage = `url(${this.data.imageSmall})`;
        this.element.style.top = "50%";
        this.element.style.left = "100%";
        this.element.style.transform = "translate(-50%, -50%)";
        this.element.dataset.name = this.data.name;
        this.element.setAttribute("role", "button");
        this.element.setAttribute("aria-label", `Planet ${this.data.name}`);

        this.element.addEventListener("click", () =>
            routeToPlanet(this.data.name)
        );

        container.appendChild(this.element);
    }
}
