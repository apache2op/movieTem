const APIKEY = "04c35731a5ee918f014970082a0088b1";
const IMGPATH = "https://image.tmdb.org/t/p/w1280";
const SEARCHAPI = `https://api.themoviedb.org/3/search/movie?api_key=${APIKEY}&query=`;
const GENREAPI = `https://api.themoviedb.org/3/genre/movie/list?api_key=${APIKEY}`;

const movieBox = document.querySelector("#movie-box");
const genreSelect = document.getElementById("genre-select");
const yearSelect = document.getElementById("year-select");
const languageSelect = document.getElementById("language-select");
const searchInput = document.getElementById("search");
const sortReviewBtn = document.getElementById("sort-review");

let currentPage = 1;
let totalPages = 1;
let searchQuery = "";

let genreMap = {};
fetch(GENREAPI)
  .then((resp) => resp.json())
  .then((data) => {
    data.genres.forEach((genre) => {
      genreMap[genre.id] = genre.name;
      const option = document.createElement("option");
      option.value = genre.id;
      option.textContent = genre.name;
      genreSelect.append(option);
    });
  });

const currentYear = new Date().getFullYear();
for (let y = currentYear; y >= 1950; y--) {
  const option = document.createElement("option");
  option.value = y;
  option.textContent = y;
  yearSelect.append(option);
}

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
];
languages.forEach((l) => {
  const option = document.createElement("option");
  option.value = l.code;
  option.textContent = l.name;
  languageSelect.append(option);
});

function getApiUrl(page = 1) {
  let url;
  if (searchQuery && searchQuery.trim().length > 0) {
    url = `${SEARCHAPI}${encodeURIComponent(searchQuery)}`;
    if (genreSelect.value) url += `&with_genres=${genreSelect.value}`;
    if (yearSelect.value) url += `&primary_release_year=${yearSelect.value}`;
    if (languageSelect.value)
      url += `&with_original_language=${languageSelect.value}`;
    url += `&page=${page}`;
  } else {
    url = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${APIKEY}&page=${page}`;
    if (genreSelect.value) url += `&with_genres=${genreSelect.value}`;
    if (yearSelect.value) url += `&primary_release_year=${yearSelect.value}`;
    if (languageSelect.value)
      url += `&with_original_language=${languageSelect.value}`;
  }
  return url;
}

const getMovies = async (url, append = false) => {
  const response = await fetch(url);
  const data = await response.json();
  totalPages = data.total_pages;
  showMovies(data.results, append);
};

function showMovies(movies, append = false) {
  if (!append) movieBox.innerHTML = "";
  if (!movies || movies.length === 0) {
    if (!append)
      movieBox.innerHTML =
        "<p style='color:#2196F3;font-size:1.5em;text-align:center;'>No movies found!</p>";
    return;
  }
  movies.forEach((result) => {
    const imagePath = result.poster_path
      ? IMGPATH + result.poster_path
      : "img/image-missing.png";
    const box = document.createElement("div");
    box.classList.add("box");
    box.style.cursor = "pointer";
    box.innerHTML = `
            <img src="${imagePath}" alt="${result.original_title}">
            <div class="overlay">
                <div class="title">
                    <h2>${result.original_title}</h2>
                    <span>${result.vote_average}</span>
                </div>
                <h3>Overview</h3>
                <p>${result.overview}</p>
            </div>
        `;
    box.addEventListener("click", function () {
      window.location.href = `details.html?id=${result.id}`;
    });
    movieBox.appendChild(box);
  });
}

// Infinite scroll
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 160) {
    if (currentPage < totalPages) {
      currentPage++;
      let nextUrl = getApiUrl(currentPage);
      getMovies(nextUrl, true);
    }
  }
});

function resetAndFetchMovies() {
  currentPage = 1;
  let url = getApiUrl(currentPage);
  getMovies(url, false);
}

function handleFilterUpdate() {
  searchQuery = searchInput.value;
  resetAndFetchMovies();
}

genreSelect.addEventListener("change", handleFilterUpdate);
yearSelect.addEventListener("change", handleFilterUpdate);
languageSelect.addEventListener("change", handleFilterUpdate);
searchInput.addEventListener("keyup", handleFilterUpdate);

// Sort by Review button handler
sortReviewBtn.addEventListener("click", async function () {
  let url = getApiUrl(1);
  const response = await fetch(url);
  const data = await response.json();

  // Get reviews count for each movie (first 20)
  let reviewPromises = data.results.map((movie) =>
    fetch(
      `https://api.themoviedb.org/3/movie/${movie.id}/reviews?api_key=${APIKEY}`
    )
      .then((r) => r.json())
      .then((r) => ({
        ...movie,
        reviewCount: r.results ? r.results.length : 0,
      }))
  );

  let moviesWithReviews = await Promise.all(reviewPromises);

  // Sort by most reviews (descending)
  moviesWithReviews.sort((a, b) => b.reviewCount - a.reviewCount);

  showMovies(moviesWithReviews, false);
});

resetAndFetchMovies();

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
