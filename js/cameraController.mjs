const camera = {
    x: -1500,
    y: -1500,
    scale: 1
};

const MIN_SCALE = 0.4;
const MAX_SCALE = 3;
const FLY_IN_SCALE = 6;
const FLY_IN_VERTICAL_OFFSET = 120; // pixels to nudge planet toward vertical center

const viewport = document.getElementById("viewport");
const solarWorld = document.getElementById("solar-system");
let isFlying = false;

if (!viewport || !solarWorld) {
    console.warn("Camera controller: missing #viewport or #solar-system");
}

solarWorld?.addEventListener("click", (event) => {
    const planetEl = event.target.closest(".planet");
    if (!planetEl) return;
    if (isFlying) return;
    focusOnPlanet(planetEl);
});


let isDragging = false;
let lastX = 0;
let lastY = 0;

viewport?.addEventListener("mousedown", (e) => {
    if (isFlying) return;
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
    if (isFlying) return;

    camera.x += e.clientX - lastX;
    camera.y += e.clientY - lastY;

    lastX = e.clientX;
    lastY = e.clientY;

    updateCamera();
});


viewport?.addEventListener(
    "wheel",
    (e) => {
        if (isFlying) return;
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
        if (isFlying) return;
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
        if (isFlying) return;
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
        if (isFlying) return;
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
    if (!solarWorld || !viewport) return;
    const planetName = planetEl.dataset.name;
    if (!planetName) return;
    const rect = planetEl.getBoundingClientRect();
    const planetScreenX = rect.left + rect.width / 2;
    const planetScreenY = rect.top + rect.height / 2;
    const viewportRect = viewport.getBoundingClientRect();
    const baseX = viewportRect.left + viewportRect.width / 2;
    const baseY = viewportRect.top + viewportRect.height / 2;
    const originX = solarWorld.offsetWidth / 2;
    const originY = solarWorld.offsetHeight / 2;
    const currentScale = camera.scale;
    const targetScale = FLY_IN_SCALE;
    const planetWorldX = originX + (planetScreenX - baseX - camera.x - originX) / currentScale;
    const planetWorldY = originY + (planetScreenY - baseY - camera.y - originY) / currentScale;

    planetEl.classList.add("is-target");
    solarWorld.classList.add("is-flying");
    viewport.classList.add("is-flying");
    isFlying = true;

    camera.x = -(targetScale * (planetWorldX - originX) + originX);
    // Nudge the final camera Y a bit further up so the clicked
    // planet appears closer to the vertical center of the viewport.
    camera.y = -(targetScale * (planetWorldY - originY) + originY) - FLY_IN_VERTICAL_OFFSET;
    camera.scale = targetScale;

    solarWorld.style.transition = "transform 3s cubic-bezier(0.2, 0.8, 0.2, 1)";
    updateCamera();

    setTimeout(() => {
        window.location.href = `planet-pages/planet.html?planet=${planetName}`;
    }, 1150);
}
