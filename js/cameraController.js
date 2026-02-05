const camera = {
    x: -1500,
    y: -1500,
    scale: 1
};

const MIN_SCALE = 0.4;
const MAX_SCALE = 3;

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


viewport?.addEventListener(
    "wheel",
    (e) => {
        e.preventDefault();

        const zoomAmount = e.deltaY * -0.001;
        camera.scale = Math.min(Math.max(MIN_SCALE, camera.scale + zoomAmount), MAX_SCALE);

        updateCamera();
    },
    { passive: false }
);

let isTouchDragging = false;
let lastTouchX = 0;
let lastTouchY = 0;
let lastPinchDistance = 0;

viewport?.addEventListener(
    "touchstart",
    (e) => {
        if (e.target.closest(".planet")) return;
        if (e.touches.length === 1) {
            isTouchDragging = true;
            lastTouchX = e.touches[0].clientX;
            lastTouchY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            isTouchDragging = false;
            lastPinchDistance = getTouchDistance(e.touches[0], e.touches[1]);
        }
    },
    { passive: false }
);

viewport?.addEventListener(
    "touchmove",
    (e) => {
        e.preventDefault();
        if (e.touches.length === 1 && isTouchDragging) {
            const touch = e.touches[0];
            camera.x += touch.clientX - lastTouchX;
            camera.y += touch.clientY - lastTouchY;
            lastTouchX = touch.clientX;
            lastTouchY = touch.clientY;
            updateCamera();
        } else if (e.touches.length === 2) {
            const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
            if (lastPinchDistance) {
                const zoomDelta = (currentDistance - lastPinchDistance) * 0.002;
                camera.scale = Math.min(Math.max(MIN_SCALE, camera.scale + zoomDelta), MAX_SCALE);
                updateCamera();
            }
            lastPinchDistance = currentDistance;
        }
    },
    { passive: false }
);

viewport?.addEventListener(
    "touchend",
    (e) => {
        if (e.touches.length === 0) {
            isTouchDragging = false;
            lastPinchDistance = 0;
        } else if (e.touches.length === 1) {
            isTouchDragging = true;
            lastTouchX = e.touches[0].clientX;
            lastTouchY = e.touches[0].clientY;
            lastPinchDistance = 0;
        }
    },
    { passive: false }
);

function updateCamera() {
    if (!solarWorld) return;
    solarWorld.style.transform = `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`;
}

function getTouchDistance(t1, t2) {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.hypot(dx, dy);
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
