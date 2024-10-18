// Spotify App Config
const clientId = 'bceea381307146a283505191ab943fdd'; 
const redirectUri = 'https://rsm-aburda.github.io/452_spotify_test/'; 
const scopes = 'user-top-read';

// Set Cookie
function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;Secure;SameSite=Lax`;
}

// Get Cookie
function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) return value;
  }
  return null;
}

// Delete Cookie
function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

// Spotify Login - Redirect to Authorization Page
document.getElementById('login-btn').addEventListener('click', () => {
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${scopes}&response_type=token&show_dialog=true`;
  window.location.href = authUrl;
});

// Get Access Token from URL Hash or Cookie
function getAccessToken() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  let token = params.get('access_token');

  if (token) {
    setCookie('spotify_access_token', token, 1); // Store in cookie for 1 day
    window.history.replaceState({}, document.title, window.location.pathname);
  } else {
    token = getCookie('spotify_access_token');
  }

  return token;
}

// Fetch Spotify Data
async function fetchSpotifyData(endpoint) {
  const token = getAccessToken();
  if (!token) {
    console.warn('No access token found. Please log in.');
    return [];
  }

  try {
    const response = await fetch(`https://api.spotify.com/v1/me/top/${endpoint}?limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      return data.items;
    } else {
      console.error('API Error:', await response.json());

      // If the token is expired or invalid, clear the cookie and prompt login
      if (response.status === 401) {
        deleteCookie('spotify_access_token');
        alert('Session expired. Please log in again.');
        document.getElementById('login-btn').style.display = 'block';
      }
      return [];
    }
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}

// Display Artists
function displayArtists(artists) {
  const container = document.getElementById('artists-container');
  container.innerHTML = '';

  artists.forEach(artist => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `<a href="${artist.external_urls.spotify}" target="_blank">${artist.name}</a>`;
    container.appendChild(listItem);
  });
}

// Display Tracks with Flip Card
function displayTracks(tracks) {
  const container = document.getElementById('tracks-container');
  container.innerHTML = '';

  tracks.forEach(track => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <img src="${track.album.images[0].url}" alt="${track.name}" />
          <p>${track.name}</p>
        </div>
        <div class="card-back">
          <p>${track.artists[0].name}</p>
          <img src="${track.artists[0].images ? track.artists[0].images[0].url : ''}" alt="${track.artists[0].name}" />
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Initialize the App
async function initialize() {
  const artists = await fetchSpotifyData('artists');
  displayArtists(artists);

  const tracks = await fetchSpotifyData('tracks');
  displayTracks(tracks);
}

// Check Token and Initialize App
const token = getAccessToken();
if (token) {
  document.getElementById('login-btn').style.display = 'none';
  initialize();
} else {
  document.getElementById('login-btn').style.display = 'block';
}

