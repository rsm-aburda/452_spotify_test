// Spotify App Config
const clientId = 'bceea381307146a283505191ab943fdd'; 
const redirectUri = 'https://rsm-aburda.github.io/452_spotify_test/'; 
const scopes = 'user-top-read';

// Spotify Login - Redirect to Authorization Page
document.getElementById('login-btn').addEventListener('click', () => {
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${scopes}&response_type=token&show_dialog=true`;
  window.location.href = authUrl;
});

// Get Access Token
function getAccessToken() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  let token = params.get('access_token');

  if (token) {
    localStorage.setItem('spotify_access_token', token);
    window.history.replaceState({}, document.title, window.location.pathname);
  } else {
    token = localStorage.getItem('spotify_access_token');
  }

  return token;
}

// Fetch Spotify Data
async function fetchSpotifyData(endpoint) {
  const token = getAccessToken();
  if (!token) return;

  try {
    const response = await fetch(`https://api.spotify.com/v1/me/top/${endpoint}?limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      return data.items;
    } else {
      console.error('API Error:', await response.json());
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
}
window.onSpotifyWebPlaybackSDKReady = () => {
  const token = getAccessToken();
  const player = new Spotify.Player({
    name: 'Spotify Web Player',
    getOAuthToken: cb => { cb(token); },
    volume: 0.5
  });

  // Error handling
  player.addListener('initialization_error', ({ message }) => { console.error(message); });
  player.addListener('authentication_error', ({ message }) => { console.error(message); });
  player.addListener('account_error', ({ message }) => { console.error(message); });
  player.addListener('playback_error', ({ message }) => { console.error(message); });

  // Connect to the player!
  player.connect();

  // Function to play a specific track
  function playTrack(trackUri) {
    fetch(`https://api.spotify.com/v1/me/player/play`, {
      method: 'PUT',
      body: JSON.stringify({ uris: [trackUri] }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // Modify your track cards to include a play button
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
            <button onclick="playTrack('${track.uri}')">Play</button>
          </div>
          <div class="card-back">
            <p>${track.artists[0].name}</p>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  initialize(); // Make sure this is called
};
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
          <iframe
            src="https://open.spotify.com/embed/track/${track.id}"
            width="100%"
            height="80"
            frameborder="0"
            allowtransparency="true"
            allow="encrypted-media">
          </iframe>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

