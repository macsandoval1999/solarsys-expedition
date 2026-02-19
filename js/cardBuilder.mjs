/* This module provides functions for creating and managing favorite buttons and cards for items, such as planets or images. It includes functions to set the state of favorite buttons, create toggle buttons, build favorite cards, create gallery figures, build captions for NASA images, and create APOD cards. The functions are designed to be flexible and customizable through the use of options and configuration objects. */



export function setFavoriteButtonState(button, isFavorite)
/* This function sets the state of a favorite button, including its appearance and accessibility attributes (aria-label and aria-pressed), based on whether the item is currently favorited or not. 
parameters: button - the button element to update
            isFavorite - a boolean indicating whether the item is favorited*/
{
	button.classList.toggle("is-favorited", isFavorite); // toggle the "is-favorited" class on the button element based on the isFavorite parameter, which can be used to apply different styles to the button when it is in a favorited state.
	button.setAttribute("aria-pressed", isFavorite ? "true" : "false"); // This sets the "aria-pressed" attribute to "true" if the item is favorited, or "false" if it is not, which helps screen readers understand the state of the button.
	button.textContent = isFavorite ? "★" : "☆"; // check if the item is favorited and set the button text to a filled star (★) if it is, or an empty star (☆) if it is not.
	button.setAttribute("aria-label", isFavorite ? "Remove favorite" : "Add favorite"); // check if the item is favorited and set the "aria-label" attribute to "Remove favorite" if it is, or "Add favorite" if it is not, which provides a clear description of the button's action for screen readers.
}



export function createFavoriteToggle(item, options = {})
/* This function creates a favorite toggle botton for a given item. It takes an item and an options object that can include the initial favorite state, a callback function to handle toggle actions, and another callback to execute after toggling. The button's appearance and behavior are set up based on these parameters. 
parameters: item - the item to be favorited
            options - an object containing optional parameters:
                isFavorite - the initial favorite state (default: true)
                onToggle - a callback function to handle toggle actions
                onAfterToggle - a callback function to execute after toggling 
return: the created favorite button element */
{
	const button = document.createElement("button");
	button.type = "button";
	button.className = "favorite-button";
	const initialState = options.isFavorite ?? true; // check if the initial favorite state is provided in the options object, and use it. If not provided, it defaults to true (favorited).
	setFavoriteButtonState(button, initialState);   // call the setFavoriteButtonState function to set the initial state of the button based on the initialState variable.

	button.addEventListener("click", () => {
		const nextState = options.onToggle ? options.onToggle(item) : !initialState; // check if an onToggle callback function is provided in the options object. If it is, call the function with the item as an argument to determine the next state. If not provided, simply toggle the state by negating the initialState.
		setFavoriteButtonState(button, Boolean(nextState)); // update the button state based on the nextState value
		if (options.onAfterToggle) {
			options.onAfterToggle(item, Boolean(nextState)); // call the onAfterToggle callback function if provided, passing the item and the new state as arguments, allowing for any additional actions to be performed after the toggle state has been updated.
		}
	});
	return button;
}



export function buildFavoriteCard(item, config)
/* function creates cards for favorited items. Takes an item and a config object that can include title, alt text, meta lines, a link URL and text, and a toggleBuilder function for creating a favorite toggle button. The function returns a figure element representing the favorite card, or null if the item does not have an image URL.
parameters: item - the item to create a card for
            config - an object containing optional parameters:
                title - the title to display on the card
                alt - the alt text for the image
                metaLines - an array of strings to display as metadata
                linkUrl - a URL to link to in the card
                linkText - the text for the link (defaults to the URL if not provided)
                toggleBuilder - a function that creates a favorite toggle button for the item 
return: a figure element representing the favorite card, or null if the item does not have an image URL */
{
    //Path 1
    if (!item?.imageUrl) return null; // check if the item has an imageUrl property. If it does not, return null, as the card cannot be created without an image.
    
    // Path 2
	const figure = document.createElement("figure");
	figure.className = "favorite-card";

	const img = document.createElement("img");
	img.src = item.imageUrl; 
	img.alt = config?.alt ?? config?.title ?? "Favorite"; //check if alt text is provided, and use it. If not provided, check if a title is provided and use that as alt text. If neither is provided, default to "Favorite".
	img.loading = "lazy";
	figure.appendChild(img);

	if (config?.toggleBuilder) { //check if a toggleBuilder function is provided in the config object. 
		figure.appendChild(config.toggleBuilder(item)); // If it is, call the function with the item as an argument to create a favorite toggle button, and append it to the figure element.
	}

	const figcaption = document.createElement("figcaption");
	const title = document.createElement("div");
	title.className = "favorite-title";
	title.textContent = config?.title ?? "Favorite"; //check if a title is provided, and use it. If not provided, default to "Favorite".
	figcaption.appendChild(title);

	(config?.metaLines ?? []).forEach((line) => { // check if metaLines is provided in the config object, and use it. If not provided, default to an empty array. Then iterate over each line in the metaLines array and create a div element for each line, setting its class to "favorite-meta" and its text content to the line. Finally, append each meta div to the figcaption element.
		const meta = document.createElement("div");
		meta.className = "favorite-meta";
		meta.textContent = line;
		figcaption.appendChild(meta);
	});

	if (config?.linkUrl) { 
		const link = document.createElement("a");
		link.className = "favorite-meta favorite-meta-link";
		link.href = config.linkUrl;
		link.target = "_blank";
		link.rel = "noopener noreferrer";
		link.textContent = config.linkText ?? config.linkUrl; //check if linkText is provided, and use it. If not provided, default to the linkUrl.
		figcaption.appendChild(link);
	}

	figure.appendChild(figcaption);
	return figure;
}



export function createGalleryFigure(options)
/* This function creates a figure element for a gallery image. It takes an options object that can include the image source, alt text, caption HTML, and a favorite button. The function returns a figure element representing the gallery image card.
parameters: options - an object containing optional parameters:
                src - the source URL of the image
                alt - the alt text for the image
                captionHtml - the HTML string for the caption
                favoriteButton - a button element to toggle favorite state 
return: a figure element representing the gallery image card */
{
	const figure = document.createElement("figure");
	figure.classList.add("planet-image-card");

	const img = document.createElement("img");
	img.src = options.src;
	img.alt = options.alt ?? "Gallery image";
	img.loading = "lazy";
    figure.appendChild(img);
    
	if (options.favoriteButton) {
		figure.appendChild(options.favoriteButton);
	}
	if (options.captionHtml) {
		const figcaption = document.createElement("figcaption");
		figcaption.innerHTML = options.captionHtml;
		figure.appendChild(figcaption);
	}
	return figure;
}



export function buildNasaCaption(metadata, displayName)
/* This function builds the caption HTML for a NASA image. It takes metadata about the image and the display name of the planet, and returns an HTML string that includes the title, date created, creator, and planet name.
parameters: metadata - an object containing metadata about the NASA image
            displayName - the display name of the planet
return: an HTML string representing the caption */
{
	const title = metadata?.title ?? `${displayName} NASA image`;
	const dateCreated = metadata?.date_created ?? "Date unavailable";
	const secondaryCreator = metadata?.secondary_creator ?? "Creator unavailable";
	return `
		<div class="favorite-title">${title}</div>
		<div class="favorite-meta">Planet: ${displayName}</div>
		<div class="favorite-meta">Date: ${dateCreated}</div>
		<div class="favorite-meta">Creator: ${secondaryCreator}</div>
	`;
}



export function createApodCard(options)
/* This function creates an APOD (Astronomy Picture of the Day) card. It takes an options object that can include the title, favorite button, date, media type, media URL, explanation, and meta URL. The function returns an article element representing the APOD card.
parameters: options - an object containing optional parameters:
                title - the title of the APOD
                favoriteButton - a button element to toggle favorite state
                date - the date of the APOD
                mediaType - the type of media ("image" or "video")
                mediaUrl - the URL of the media
                explanation - the explanation text for the APOD
                metaUrl - the URL for additional metadata
return: an article element representing the APOD card */
{
	const card = document.createElement("article");
	card.className = "apod-card";

	const heading = document.createElement("h2");
	heading.textContent = options.title ?? "Picture of the Day";
	card.appendChild(heading);

	if (options.favoriteButton) {
		card.appendChild(options.favoriteButton);
	}

	if (options.date) {
		const dateEl = document.createElement("p");
		dateEl.className = "apod-date";
		dateEl.textContent = options.date;
		card.appendChild(dateEl);
	}

	if (options.mediaType === "video") {
		const iframe = document.createElement("iframe");
		iframe.className = "apod-media";
		iframe.src = options.mediaUrl;
		iframe.title = options.title ?? "APOD video";
		iframe.loading = "lazy";
		iframe.allowFullscreen = true;
		card.appendChild(iframe);
	} else if (options.mediaUrl) {
		const img = document.createElement("img");
		img.className = "apod-media";
		img.src = options.mediaUrl;
		img.alt = options.title ?? "APOD image";
		img.loading = "lazy";
		card.appendChild(img);
	}

	if (options.explanation) {
		const text = document.createElement("p");
		text.className = "apod-explanation";
		text.textContent = options.explanation;
		card.appendChild(text);
	}

	const meta = document.createElement("div");
	meta.className = "apod-meta";

	if (options.metaUrl) {
		const apodLink = document.createElement("a");
		apodLink.className = "apod-meta-link";
		apodLink.href = options.metaUrl;
		apodLink.target = "_blank";
		apodLink.rel = "noopener noreferrer";
		apodLink.textContent = options.metaUrl.replace(/^https?:\/\//, "");
		meta.appendChild(apodLink);
	}

	if (options.mediaType) {
		const mediaTypeRow = document.createElement("div");
		mediaTypeRow.className = "apod-meta-row";
		mediaTypeRow.textContent = `Media type: ${options.mediaType}`;
		meta.appendChild(mediaTypeRow);
	}

	card.appendChild(meta);
	return card;
}
