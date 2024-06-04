const MAX_POKEMON = 151; // Maximale Anzahl der Pokémon
const POKEMON_LOAD_INCREMENT = 40; // Anzahl der Pokémon, die pro Klick geladen werden
let currentOffset = 0; // Der aktuelle Offset zum Laden der Pokémon

const listWrapper = document.querySelector(".list-wrapper");
const searchInput = document.querySelector("#search-input");
const nameFilter = document.querySelector("#name");
const numberFilter = document.querySelector("#number");
const notFoundMessage = document.querySelector("#not-found-message");

// "Load More"-Button erstellen
const loadMoreButton = document.createElement("button");
loadMoreButton.textContent = "Load More";
loadMoreButton.className = "load-more-button";
listWrapper.after(loadMoreButton); // Button unterhalb der Liste platzieren

let allPokemon = [];

function fetchPokemonData(offset = 0, limit = POKEMON_LOAD_INCREMENT) {
  fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`)
    .then((response) => response.json())
    .then((data) => {
      allPokemon = [...allPokemon, ...data.results]; // Ergänzt die neuen Daten zu den bereits vorhandenen
      displayPokemons(allPokemon); // Zeigt die Pokémon an
      if (allPokemon.length < MAX_POKEMON) {
        loadMoreButton.style.display = "block"; // Zeigt den "Load More"-Button an, wenn noch mehr Pokémon geladen werden können
      } else {
        loadMoreButton.style.display = "none"; // Versteckt den "Load More"-Button, wenn alle Pokémon geladen sind
      }
    })
    .catch((error) => console.error("Failed to fetch Pokemon data:", error)); // Fehlerbehandlung
}

// Initialer Aufruf zum Laden der ersten 40 Pokémon
fetchPokemonData(); 

async function fetchPokemonDetails(id) {
  try {
    const [pokemon, pokemonSpecies] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) =>
        res.json()
      ),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((res) =>
        res.json()
      ),
    ]);
    return true;
  } catch (error) {
    console.error("Failed to catch Pokemon data before redirect");
    return false; 
  }
}

function displayPokemons(pokemonArray) { 
  listWrapper.innerHTML = ""; // Leert das Wrapper-Element

  pokemonArray.forEach((pokemon) => {
    const pokemonID = pokemon.url.split("/")[6]; // Extrahiert die ID des Pokémon aus der URL
    const listItem = document.createElement("div"); // Erstellt ein div-Element für das Pokémon
    listItem.className = "list-item"; // Setzt die Klasse für das Styling
    listItem.innerHTML = /*html*/ `
      <div class="number-wrap">
          <p class="caption-fonts headline">#${pokemonID}</p>
      </div>
      <div class="img-wrap">
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemonID}.svg" alt="">
      </div>
      <div class="name-wrap">
          <p class="body3-fonts headline">${pokemon.name}</p> 
      </div>
    `;

    listItem.addEventListener("click", async () => {
      const success = await fetchPokemonDetails(pokemonID); // Abrufen der Details
      if (success) {
        window.location.href = `./detail.html?id=${pokemonID}`; // Weiterleiten zur Detailseite
      }
    });

    listWrapper.appendChild(listItem); // Hinzufügen des Pokémon zur Liste
  });
}

searchInput.addEventListener("keyup", handleSearch);

function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase(); // Konvertiert den Suchbegriff in Kleinbuchstaben
  let filteredPokemons;

  if (numberFilter.checked) {
    filteredPokemons = allPokemon.filter((pokemon) => {
      const pokemonID = pokemon.url.split("/")[6];
      return pokemonID.startsWith(searchTerm);
    });
  } else if (nameFilter.checked) {
    filteredPokemons = allPokemon.filter((pokemon) =>
      pokemon.name.toLowerCase().startsWith(searchTerm)
    );
  } else {
    filteredPokemons = allPokemon; // Wenn kein Filter ausgewählt ist, zeigt alle Pokémon an
  }

  displayPokemons(filteredPokemons); // Zeigt die gefilterten Pokémon an

  if (filteredPokemons.length === 0) {
    notFoundMessage.style.display = "block";
  } else {
    notFoundMessage.style.display = "none";
  }
}

const closeButton = document.querySelector(".search-close-icon");
closeButton.addEventListener("click", clearSearch);

function clearSearch() {
  searchInput.value = ""; // Leert das Suchfeld
  displayPokemons(allPokemon); // Zeigt alle Pokémon an
  notFoundMessage.style.display = "none"; // Versteckt die "Nicht gefunden"-Nachricht
}

const toggleFilterPopupEl = document.querySelector('.sort-wrap');
toggleFilterPopupEl.addEventListener('click', toggleFilterPopup)

function toggleFilterPopup() {
  const filterPopupEl = document.querySelector('.filter-wrapper');
  
  if (filterPopupEl.style.display == 'block') {
    filterPopupEl.style.display = 'none';
  } else {
    filterPopupEl.style.display = 'block';
  }
}

// Event-Listener für den "Load More"-Button
loadMoreButton.addEventListener("click", () => {
  // Berechnet die verbleibenden Pokémon, die noch geladen werden können
  const remainingPokemons = MAX_POKEMON - allPokemon.length;
  const loadCount = Math.min(remainingPokemons, POKEMON_LOAD_INCREMENT); // Bestimmt die Anzahl der Pokémon, die noch geladen werden sollen

  currentOffset += loadCount; // Erhöht den Offset um die Anzahl der zu ladenden Pokémon
  fetchPokemonData(currentOffset, loadCount); // Lädt die nächsten Pokémon
});

const dialogElem = document.getElementById("dialog");
const showBtn = document.querySelector(".show");
const closeBtn = document.querySelector(".close");

showBtn.addEventListener("click", () => {
  dialogElem.showModal();
});

closeBtn.addEventListener("click", () => {
  dialogElem.close();
});
