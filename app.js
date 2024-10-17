const clientId = '4688046ee89041c781086e656fea3bd6'; // Replace with your Client ID
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
  return params.get('access_token');
}

// Fetch data from Spotify API
async function fetchSpotifyData(endpoint) {
  const token = getAccessToken();
  if (!token) {
    console.error('No access token found.');
    return;
  }

  const response = await fetch(`https://api.spotify.com/v1/me/top/${endpoint}?limit=10`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (response.ok) {
    return response.json();
  } else {
    console.error('Failed to fetch Spotify data');
    return null;
  }
}

// Render circles with D3.js
function renderData(data, container, type) {
  container
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', (d, i) => (i + 1) * 70)
    .attr('cy', 75)
    .attr('r', d => (type === 'artist' ? d.popularity / 2 : d.track_number * 2))
    .attr('class', 'circle')
    .append('title')
    .text(d => (type === 'artist' ? d.name : `${d.name} - ${d.artists[0].name}`));
}

// Initialize the app
async function initialize() {
  const artistsContainer = d3.select('#artists-container');
  const tracksContainer = d3.select('#tracks-container');

  const artistsData = await fetchSpotifyData('artists');
  if (artistsData && artistsData.items) {
    renderData(artistsData.items, artistsContainer, 'artist');
  }

  const tracksData = await fetchSpotifyData('tracks');
  if (tracksData && tracksData.items) {
    renderData(tracksData.items, tracksContainer, 'track');
  }
}

// Check if the user is authenticated and initialize the app
if (getAccessToken()) {
  document.getElementById('login-btn').style.display = 'none';
  initialize();
}
