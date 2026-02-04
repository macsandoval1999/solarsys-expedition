const camera = {
    x: -1500,
    y: -1500,
    scale: 1
};

const viewport = document.getElementById("viewport");
const solarWorld = document.getElementById("solar-system");

if (!viewport || !solarWorld) {
    console.warn("Camera controller: missing #viewport or #solar-system");
}

solarWorld?.addEventListener("click", (event) => {
    const planetEl = event.target.closest(".planet");
    if (!planetEl) return;
    const planetName = planetEl.dataset.name;
    if (!planetName) return;
    window.location.href = `planet-pages/planet.html?planet=${planetName}`;
});


let isDragging = false;
let lastX = 0;
let lastY = 0;

viewport?.addEventListener("mousedown", (e) => {
    if (e.target.closest(".planet")) {
        return;
    }
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

window.addEventListener("mouseup", () => {
    isDragging = false;
});

window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    camera.x += e.clientX - lastX;
    camera.y += e.clientY - lastY;

    lastX = e.clientX;
    lastY = e.clientY;

    updateCamera();
});


viewport?.addEventListener("wheel", (e) => {
    e.preventDefault();

    const zoomAmount = e.deltaY * -0.001;
    camera.scale = Math.min(Math.max(0.4, camera.scale + zoomAmount), 5);

    updateCamera();
});

function updateCamera() {
        if (!solarWorld) return;
        solarWorld.style.transform = `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`;
}


function focusOnPlanet(planetEl) {
    const rect = planetEl.getBoundingClientRect();

    camera.x -= rect.left - window.innerWidth / 2;
    camera.y -= rect.top - window.innerHeight / 2;
    camera.scale = 4;

    if (!solarWorld) return;
    solarWorld.style.transition = "transform 1.2s ease-in-out";
    updateCamera();

    setTimeout(() => {
        window.location.href = `planet-pages/planet.html?planet=${planetEl.dataset.name}`;
    }, 1200);
}
