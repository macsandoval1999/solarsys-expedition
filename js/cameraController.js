/* This module manages the camera controls for the solar system visualization. It allows users to pan and zoom around the solar system, as well as click on planets to focus on them and navigate to their individual pages. The camera's position and scale are updated based on user interactions, and smooth transitions are implemented when focusing on a planet. The module also handles both mouse and touch events for a responsive experience across different devices. */



/**************************************************************************************************
Camera state: 
This is the starting position and scale of the camera when the page loads. It is later updated based on user interactions but will always reset to this when the page is reloaded. 
***************************************************************************************************/
const camera = {
    x: -1500,
    y: -1500,
    scale: 1
};



/* ************************************************************************************************
Camera constraints and fly-in settings: 
These constants define the minimum and maximum zoom levels, as well as the scale and vertical offset for the fly-in animation when focusing on a planet.
***************************************************************************************************/
const MIN_SCALE = 0.1;
const MAX_SCALE = 3;
const FLY_IN_SCALE = 10;
const FLY_IN_VERTICAL_OFFSET = 120; // pixels to nudge planet toward vertical center



/* ************************************************************************************************
State variables: 
isFlying is a boolean variable that tracks whether the fly-in animation is currently active. This is used to prevent user interactions (like panning or zooming) while the animation is in progress, ensuring a smooth and uninterrupted transition when focusing on a planet.
isDragging is a boolean variable that tracks whether the user is currently dragging the camera to pan around the solar system. lastX and lastY store the last known mouse or touch coordinates, which are used to calculate the change in position when dragging.
***************************************************************************************************/
let isFlying = false;  // This will control whether the fly-in animation is active, preventing user interactions during the animation.
let isDragging = false;
let lastX = 0;
let lastY = 0;



/* ************************************************************************************************
DOM elements and state variables: 
We get references to the main container for the solar system and the solar system itself. We also have a boolean variable to track whether the fly-in animation is currently active, which is used to prevent user interactions during the animation.
***************************************************************************************************/
const solsystemContainer = document.getElementById("solsystem-container"); // system container
const solarWorld = document.getElementById("solar-system"); // solar system element




/* ************************************************************************************************
Event listeners for user interactions: 
We set up event listeners for clicks on the solar system to detect when a planet is clicked, as well as mouse and touch events for dragging and zooming the camera. The event handlers update the camera's position and scale based on user input, and call the updateCamera function to apply the changes to the solar system's transform.
***************************************************************************************************/

solarWorld?.addEventListener("click", (event) =>
/* This event causes the camera to focus on a planet when it is clicked. If the fly-in animation is active, the event is ignored to prevent interruptions. */ {
    const planetEl = event.target.closest(".planet"); // check the click events target to see if it is a planet or a child of a planet element. If it is, we get the closest ancestor element with the class "planet", which will be the planet that was clicked on. 
    if (!planetEl) return; // Ignore clicks that are not on a planet element.
    if (isFlying) return; // If the fly-in animation is currently active, we ignore the click event to prevent interruptions during the animation.
    focusOnPlanet(planetEl); // Trigger the focusOnPlanet function, passing in the clicked planet element. This function will handle the fly-in animation and navigation to the planet's page.
});



solsystemContainer?.addEventListener("mousedown", (e) =>
/* This event starts the dragging process for panning the camera. If the fly-in animation is active or if the click is on a planet, the event is ignored. Otherwise, we set isDragging to true and store the initial mouse coordinates. */ {
    if (isFlying) return;
    if (e.target.closest(".planet")) {
        return;
    }
    isDragging = true;
    lastX = e.clientX; // Store the initial X coordinate of the mouse when the dragging starts. This will be used to calculate how much the mouse has moved during the dragging process.
    lastY = e.clientY; // Store the initial Y coordinate of the mouse when the dragging starts. This will be used to calculate how much the mouse has moved during the dragging process.
});



solsystemContainer?.addEventListener("dragstart", (e) =>
/* If somehow a drag event is triggered (like dragging an image), we prevent the default behavior to avoid unintended interactions while trying to pan the camera. */ {
    e.preventDefault();
});



window.addEventListener("mouseup", () =>
/* This event ends the dragging process for panning the camera. When the mouse button is released, we set isDragging to false to stop updating the camera's position based on mouse movements. */ {
    isDragging = false;
});



window.addEventListener("mousemove", (e) =>
/* This event updates the camera's position based on mouse movements while dragging. If the fly-in animation is active, the event is ignored. Otherwise, we calculate the change in mouse position and update the camera's x and y coordinates accordingly, then call updateCamera to apply the changes. */ {
    if (!isDragging) return;
    if (isFlying) return;

    camera.x += e.clientX - lastX; // Update the camera's x coordinate based on the change in mouse position since the last recorded coordinates. This will pan the camera horizontally as the mouse moves.
    camera.y += e.clientY - lastY;// Update the camera's y coordinate based on the change in mouse position since the last recorded coordinates. This will pan the camera vertically as the mouse moves.

    lastX = e.clientX; // Update lastX to the current mouse X coordinate for the next movement calculation.
    lastY = e.clientY; // Update lastY to the current mouse Y coordinate for the next movement calculation.

    updateCamera();
});



solsystemContainer?.addEventListener("wheel", (e) =>
/* This event handles zooming the camera in and out based on the mouse wheel. If the fly-in animation is active, the event is ignored. Otherwise, we calculate the zoom amount from the wheel delta, update the camera's scale while constraining it within the defined minimum and maximum values, and call updateCamera to apply the changes. */ {
    if (isFlying) return;
    e.preventDefault();

    const zoomAmount = e.deltaY * -0.001;
    camera.scale = Math.min(Math.max(MIN_SCALE, camera.scale + zoomAmount), MAX_SCALE);

    updateCamera();
},
    { passive: false }
);


/* MOBILE TOUCH EVENTS:
/* ******************************************************************************************
Touch event listeners for mobile devices: 
We also set up touch event listeners to allow for panning and zooming on touch screens. The touchstart event initializes dragging or pinch-zooming based on the number of touches, while the touchmove event updates the camera's position or scale accordingly. The touchend event resets the dragging state when touches end.
***************************************************************************************************/

let isTouchDragging = false;
let lastTouchX = 0;
let lastTouchY = 0;
let lastPinchDistance = 0;



solsystemContainer?.addEventListener("touchstart", (e) =>
/* This event starts the touch dragging or pinch-zooming process. If the fly-in animation is active or if the touch is on a planet, the event is ignored. If there is one touch, we start dragging; if there are two touches, we start pinch-zooming by calculating the initial distance between the two touches. */ {
    if (isFlying) return;
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



solsystemContainer?.addEventListener("touchmove", (e) =>
/* This event updates the camera's position or scale based on touch movements. If the fly-in animation is active, the event is ignored. If there is one touch and we are dragging, we update the camera's position based on the change in touch coordinates. If there are two touches, we calculate the new distance between them and update the camera's scale for pinch-zooming. */ {
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


solsystemContainer?.addEventListener("touchend", (e) =>
/* This event ends the touch dragging or pinch-zooming process. If the fly-in animation is active, the event is ignored. If all touches have ended, we reset the dragging state and pinch distance. If one touch remains, we switch to dragging mode with the remaining touch's coordinates. */ {
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



/* ************************************************************************************************
Helper functions: 
updateCamera applies the current camera position and scale to the solar system's CSS transform. getTouchDistance calculates the distance between two touch points, which is used for pinch-zooming. focusOnPlanet triggers the fly-in animation to focus on a specific planet and navigates to its page after the animation completes.
***************************************************************************************************/

function updateCamera()
/* When the camera's position or scale is updated (either through dragging, zooming, or focusing on a planet), this function applies the new transform to the solar system element. It uses CSS transforms to translate and scale the solar system based on the current camera state. If the solarWorld element is not available, the function returns early to avoid errors. */ {
    if (!solarWorld) return;
    solarWorld.style.transform = `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`;
}



function getTouchDistance(t1, t2)
/* This function calculates the distance between two touch points, which is used for pinch-zooming. It takes two touch objects as parameters and returns the distance between them using the Pythagorean theorem. This is used to determine the scale factor for zooming the camera. It is called in */ {
    const dx = t1.clientX - t2.clientX; // Calculate the horizontal distance between the two touch points by subtracting their X coordinates.
    const dy = t1.clientY - t2.clientY; // Calculate the vertical distance between the two touch points by subtracting their Y coordinates.
    return Math.hypot(dx, dy);
}


function focusOnPlanet(planetEl)
/* This function triggers the fly-in animation to focus on a specific planet when it is clicked. It calculates the target position and scale for the camera to center on the planet, applies the necessary CSS classes for the animation, and then navigates to the planet's page after a short delay to allow the animation to play. If the solarWorld or solsystemContainer elements are not available, or if the planet element does not have a data-name attribute, the function returns early to avoid errors. */ {
    if (!solarWorld || !solsystemContainer) return;

    const planetName = planetEl.dataset.name;

    if (!planetName) return;

    const rect = planetEl.getBoundingClientRect(); // getBoundingClientRect is a built-in method that returns the size of an element and its position relative to the viewport. We use this to get the current screen position of the planet element that was clicked on.
    const planetScreenX = rect.left + rect.width / 2;
    const planetScreenY = rect.top + rect.height / 2;
    const solsystemContainerRect = solsystemContainer.getBoundingClientRect();
    const baseX = solsystemContainerRect.left + solsystemContainerRect.width / 2;
    const baseY = solsystemContainerRect.top + solsystemContainerRect.height / 2;
    const originX = solarWorld.offsetWidth / 2;
    const originY = solarWorld.offsetHeight / 2;
    const currentScale = camera.scale;
    const targetScale = FLY_IN_SCALE;
    const planetWorldX = originX + (planetScreenX - baseX - camera.x - originX) / currentScale;
    const planetWorldY = originY + (planetScreenY - baseY - camera.y - originY) / currentScale;

    planetEl.classList.add("is-target");
    solarWorld.classList.add("is-flying");
    solsystemContainer.classList.add("is-flying");
    isFlying = true;

    camera.x = -(targetScale * (planetWorldX - originX) + originX);
    // Nudge the final camera Y a bit further up so the clicked
    // planet appears closer to the vertical center of the solsystem-container.
    camera.y = -(targetScale * (planetWorldY - originY) + originY) - FLY_IN_VERTICAL_OFFSET;
    camera.scale = targetScale;

    solarWorld.style.transition = "transform 3s cubic-bezier(0.2, 0.8, 0.2, 1)";
    updateCamera();

    setTimeout(() => {
        window.location.href = `planet-pages/planet.html?planet=${planetName}`;
    }, 1150);
}
