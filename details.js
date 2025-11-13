const APIKEY = "04c35731a5ee918f014970082a0088b1";
const IMGPATH = "https://image.tmdb.org/t/p/w780";

const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("id");
const root = document.getElementById("details-root");

if (!movieId) {
  root.innerHTML = "<h2 style='color: #2196F3'>No movie selected.</h2>";
} else {
  getMovieAllData(movieId);
}

async function getMovieAllData(id) {
  try {
    const [details, credits, similar, videos] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${APIKEY}`).then(
        (r) => r.json()
      ),
      fetch(
        `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${APIKEY}`
      ).then((r) => r.json()),
      fetch(
        `https://api.themoviedb.org/3/movie/${id}/similar?api_key=${APIKEY}`
      ).then((r) => r.json()),
      fetch(
        `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${APIKEY}`
      ).then((r) => r.json()),
    ]);
    renderDetails(details, credits, similar, videos);
  } catch (e) {
    root.innerHTML = "<h2 style='color:#e74c3c'>Failed to load details.</h2>";
  }
}

function renderDetails(details, credits, similar, videos) {
  let trailerKey = "";
  if (videos.results && videos.results.length > 0) {
    const yt = videos.results.find(
      (v) => v.type === "Trailer" && v.site === "YouTube"
    );
    if (yt) trailerKey = yt.key;
  }
  let actors = credits.cast ? credits.cast.slice(0, 7) : [];
  let similarMovies = similar.results ? similar.results.slice(0, 5) : [];
  root.innerHTML = `
        <div class='details-container'>
            <img class='poster-large' src="${
              details.poster_path
                ? IMGPATH + details.poster_path
                : "img/image-missing.png"
            }" alt="Poster">
            <div class='details-info'>
                <h1 style="color:#5865F2;margin-bottom:0.2em;">${
                  details.title
                } <span style="font-size:0.7em;font-weight:400;color:#aaa;">(${
    details.release_date ? details.release_date.slice(0, 4) : ""
  })</span></h1>
                <div class='details-section'><strong>Genres:</strong> ${details.genres
                  .map((g) => g.name)
                  .join(", ")}</div>
                <div class='details-section'><strong>Rating:</strong> ${
                  details.vote_average
                } / 10</div>
                <div class='details-section'><strong>Overview:</strong> <br>${
                  details.overview
                }</div>
                <div class='details-section'><strong>Featured Actors:</strong>
                    <ul class="actors-list">
                        ${actors
                          .map(
                            (a) =>
                              `<li class="actor-card">${a.name} <span style="color:#aaa;font-size:0.85em;">as ${a.character}</span></li>`
                          )
                          .join("")}
                    </ul>
                </div>
                <div class='details-section'><strong>Similar Movies:</strong>
                    <ul class="similar-list">
                        ${similarMovies
                          .map(
                            (m) =>
                              `<li class="similar-movie" onclick="location.href='details.html?id=${m.id}'">${m.title}</li>`
                          )
                          .join("")}
                    </ul>
                </div>
                ${
                  trailerKey
                    ? `
                <div class='details-section'><strong>Trailer:</strong>
                    <iframe class="trailer-frame" src="https://www.youtube.com/embed/${trailerKey}" allowfullscreen></iframe>
                </div>
                `
                    : ""
                }
            </div>
        </div>
    `;
}

// DARK/LIGHT MODE TOGGLE LOGIC
const modeToggle = document.getElementById("mode-toggle");
const toggleIcon = document.getElementById("toggle-icon");

if (localStorage.getItem("site-mode") === "light") {
  document.body.classList.add("light-mode");
  toggleIcon.textContent = "🌞";
} else {
  toggleIcon.textContent = "🌙";
}

modeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  if (document.body.classList.contains("light-mode")) {
    localStorage.setItem("site-mode", "light");
    toggleIcon.textContent = "🌞";
  } else {
    localStorage.setItem("site-mode", "dark");
    toggleIcon.textContent = "🌙";
  }
});
