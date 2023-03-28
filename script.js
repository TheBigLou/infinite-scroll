const imageContainer = document.getElementById('image-container');
const loader = document.getElementById('ring-loader');
const emptyState = document.getElementById('empty-state');
const topicSelector = document.getElementById('topic-selector');
const submitButton = document.getElementById('submit-button');

let readyToLoadImages = false;
let imagesLoaded = 0;
let totalImages = 0;
let photosArray = [];
let topicsArray = [];

// Unsplash API
let photoCount = 5;
const apiKey = 'AcwZARvD5FHegRTQ6XpFTIiULseKWIn08wSv8Sg_6uo';
const apiTopicUrl = `https://api.unsplash.com/topics/?client_id=${apiKey}&per_page=50`
let apiPhotosUrl = `https://api.unsplash.com/photos/random/?client_id=${apiKey}&count=${photoCount}`;

// Build form options
function buildForm() {
    topicsArray.forEach((topic) => {
        const topicOption = document.createElement('option');
        setAttributes(topicOption, {
            value: topic.id
        })
        topicOption.innerText = topic.title;
        topicSelector.appendChild(topicOption);
    })
}

// Get topics and from Unsplash API and build sorted form
async function getTopicsAndBuildForm() {
    try {
        const topicResponse = await fetch(apiTopicUrl);
        topicsArray = await topicResponse.json()
        topicsArray.sort((a, b) => {
            const topicA = a.title.toUpperCase();
            const topicB = b.title.toUpperCase();
            if (topicA < topicB) {
                return -1;
            }
            if (topicA > topicB) {
                return 1;
            }
            return 0;
        });
        buildForm();
    } catch (error) {
        console.log(error);
    }
}

// Check to see if images were loaded
function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        readyToLoadImages = true;
        loader.hidden = true;
    }
};

// Helper function to set attributes on DOM elements
function setAttributes(element, attributes) {
    for (const key in attributes) {
        element.setAttribute(key, attributes[key])
    }
}

// Create elements for links and photos, add to DOM
function displayPhotos() {
    imagesLoaded = 0;
    emptyState.hidden = true;
    totalImages = photosArray.length;
    // Run function for each object in photosArray
    photosArray.forEach((photo) => {
        // Create <a> to link to Unsplash
        const item = document.createElement('a');
        setAttributes(item, {
            href: photo.links.html,
            target: '_blank',
        });
        // Create <img> for photo
        const img = document.createElement('img');
        setAttributes(img, {
            src: photo.urls.regular,
            alt: photo.alt_description,
            title: photo.alt_description
        })
        // Event listener for when each is finished loading
        img.addEventListener('load', imageLoaded);
        // Put <img> inside <a>, then put both inside imageContainer element
        item.appendChild(img);
        imageContainer.appendChild(item);
    });
}

// Clear links and photos
function clearPhotos() {
    while (imageContainer.hasChildNodes()) {
        imageContainer.removeChild(imageContainer.firstChild);
    }
    loader.hidden = false;
    photoCount = 5;
}

// Get photos from Unsplash API
async function getPhotos() {
    try {
        const unsplashResponse = await fetch(apiPhotosUrl);
        photosArray = await unsplashResponse.json();
        displayPhotos();
    } catch (error) {
        console.log(error);
    }
}

// Build URL and fetch photos
function getFilteredPhotos() {
    clearPhotos();
    let topicString = String(document.getElementById("topic-selector").value);
    if (topicString = 'all' || '') {
        apiPhotosUrl = `https://api.unsplash.com/photos/random/?client_id=${apiKey}&count=${photoCount}`;
    } else {
        apiPhotosUrl = `https://api.unsplash.com/photos/random/?client_id=${apiKey}&count=${photoCount}&topics=${topicString}`;
    }
    getPhotos();
}

// Load more photos when scroll is near bottom of page
window.addEventListener('scroll', () => {
    if (photosArray.length > 0 && window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000 && readyToLoadImages) {
        photoCount = 30;
        readyToLoadImages = false;
        getPhotos();
    }
});

// On load
getTopicsAndBuildForm();
submitButton.addEventListener("click", getFilteredPhotos);