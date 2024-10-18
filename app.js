const clientId = 'bceea381307146a283505191ab943fdd'; // Replace with your Client ID
const redirectUri = 'https://rsm-aburda.github.io/452_spotify_test/'; // Your GitHub Pages URL
const scopes = 'user-top-read'; // Permission to access top artists and tracks

// Spotify authentication - Implicit Grant Flow
document.getElementById('login-btn').addEventListener('click', () => {
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${scopes}&response_type=token&show_dialog=true`;
  window.location.href = authUrl;
});

// Extract access token from URL
function getAccessToken() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const token = params.get('access_token');
  
  // Log the token to confirm it's being captured
  console.log('Access Token:', token);

  // Clear the token from the URL after extraction
  window.history.replaceState({}, document.title, window.location.pathname);

  return token;
}

// Fetch data from Spotify API
async function fetchSpotifyData(endpoint) {
  const token = getAccessToken();
  if (!token) {
    console.error('No access token found.');
    return;
  }

  try {
    const response = await fetch(`https://api.spotify.com/v1/me/top/${endpoint}?limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`${endpoint} Data:`, data);  // Log the response data
      return data.items;
    } else {
      const error = await response.json();
      console.error('API Error:', error);  // Log the error response
      return [];
    }
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}

// Display data inside the containers
function displayData(data, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = ''; // Clear previous content

  if (data.length === 0) {
    container.innerHTML = '<p>No data found.</p>';
    return;
  }

  data.forEach(item => {
    const element = document.createElement('p');
    element.textContent = item.name; // Display the artist or track name
    container.appendChild(element);
  });
}

// Initialize the app
async function initialize() {
  const artists = await fetchSpotifyData('artists');
  displayData(artists, 'artists-container');

  const tracks = await fetchSpotifyData('tracks');
  displayData(tracks, 'tracks-container');
}

// Check if the user is authenticated and initialize the app
if (getAccessToken()) {
  document.getElementById('login-btn').style.display = 'none'; // Hide login button if token exists
  initialize(); // Fetch and display data
}
