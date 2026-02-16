export function setFavoriteButtonState(button, isFavorite) {
	button.classList.toggle("is-favorited", isFavorite);
	button.setAttribute("aria-pressed", isFavorite ? "true" : "false");
	button.textContent = isFavorite ? "★" : "☆";
	button.setAttribute(
		"aria-label",
		isFavorite ? "Remove favorite" : "Add favorite"
	);
}

export function createFavoriteToggle(item, options = {}) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "favorite-button";
	const initialState = options.isFavorite ?? true;
	setFavoriteButtonState(button, initialState);

	button.addEventListener("click", () => {
		const nextState = options.onToggle ? options.onToggle(item) : !initialState;
		setFavoriteButtonState(button, Boolean(nextState));
		if (options.onAfterToggle) {
			options.onAfterToggle(item, Boolean(nextState));
		}
	});

	return button;
}

export function buildFavoriteCard(item, config) {
	if (!item?.imageUrl) return null;
	const figure = document.createElement("figure");
	figure.className = "favorite-card";

	const img = document.createElement("img");
	img.src = item.imageUrl;
	img.alt = config?.alt ?? config?.title ?? "Favorite";
	img.loading = "lazy";
	figure.appendChild(img);

	if (config?.toggleBuilder) {
		figure.appendChild(config.toggleBuilder(item));
	}

	const figcaption = document.createElement("figcaption");
	const title = document.createElement("div");
	title.className = "favorite-title";
	title.textContent = config?.title ?? "Favorite";
	figcaption.appendChild(title);

	(config?.metaLines ?? []).forEach((line) => {
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
		link.textContent = config.linkText ?? config.linkUrl;
		figcaption.appendChild(link);
	}

	figure.appendChild(figcaption);
	return figure;
}

export function createGalleryFigure(options) {
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

export function buildNasaCaption(metadata, displayName) {
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

export function createApodCard(options) {
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
