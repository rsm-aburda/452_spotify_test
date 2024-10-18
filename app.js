
console.log('Hello from app.js!');

const clientId = 'bceea381307146a283505191ab943fdd'; // Replace with your Client ID
const redirectUri = 'https://rsm-aburda.github.io/452_spotify_test/'; // Your GitHub Pages URL
const scopes = 'user-top-read'; // Permission to access top artists and tracks

// Spotify authentication - Implicit Grant Flow
document.getElementById('login-btn').addEventListener('click', () => {
  console.log('Login button clicked!');  // Log click
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${scopes}&response_type=token&show_dialog=true`;
  window.location.href = authUrl;
});

// Extract and store the access token in localStorage
function getAccessToken() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  let token = params.get('access_token');

  if (token) {
    console.log('Access Token:', token);
    // Store the token in localStorage for later use
    localStorage.setItem('spotify_access_token', token);
    // Clear the token from the URL to keep things clean
    window.history.replaceState({}, document.title, window.location.pathname);
  } else {
    // If the token is not in the URL, try retrieving it from localStorage
    token = localStorage.getItem('spotify_access_token');
    console.log('Retrieved token from localStorage:', token);
  }

  return token;
}

// Fetch data from Spotify API
async function fetchSpotifyData(endpoint) {
  const token = getAccessToken();
  if (!token) {
    console.error('No access token found.');
    return;
  }

  console.log(`Fetching ${endpoint} data...`);

  try {
    const response = await fetch(`https://api.spotify.com/v1/me/top/${endpoint}?limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`${endpoint} Data:`, data);
      return data.items;
    } else {
      const error = await response.json();
      console.error('API Error:', error);
      return [];
    }
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}

// Initialize the app
async function initialize() {
  console.log('Initializing app...');
  
  const artists = await fetchSpotifyData('artists');
  displayData(artists, 'artists-container');

  const tracks = await fetchSpotifyData('tracks');
  displayData(tracks, 'tracks-container');
}

// Display data inside the containers
function displayData(data, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  if (!data || data.length === 0) {
    console.log(`No data found for ${containerId}.`);
    container.innerHTML = '<p>No data found.</p>';
    return;
  }

  data.forEach(item => {
    const element = document.createElement('p');
    element.textContent = item.name;
    container.appendChild(element);
  });
}

// Check if the user is authenticated and initialize the app
if (getAccessToken()) {
  console.log('Access token found, hiding login button...');
  document.getElementById('login-btn').style.display = 'none';
  initialize();
} else {
  console.log('No access token found.');
}
