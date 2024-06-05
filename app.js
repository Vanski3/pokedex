const MAX_POKEMON = 151; // Maximale Anzahl der Pokémon
const POKEMON_LOAD_INCREMENT = 40; // Anzahl der Pokémon, die pro Klick geladen werden
let currentOffset = 0; // Der aktuelle Offset zum Laden der Pokémon

const listWrapper = document.querySelector(".list-wrapper");
const searchInput = document.querySelector("#search-input");
const nameFilter = document.querySelector("#name");
const numberFilter = document.querySelector("#number");
const notFoundMessage = document.querySelector("#not-found-message");
const dialog = document.createElement("dialog");
document.body.appendChild(dialog);

// "Load More"-Button erstellen
const loadMoreButton = document.createElement("button");
loadMoreButton.textContent = "Load More";
loadMoreButton.className = "load-more-button";
listWrapper.after(loadMoreButton); // Button unterhalb der Liste platzieren

let allPokemon = [];
let filteredPokemons = [];

function getTypeColor(type) {
  const typeColors = {
    normal: "#A8A77A",
    fire: "#EE8130",
    water: "#6390F0",
    electric: "#F7D02C",
    grass: "#7AC74C",
    ice: "#96D9D6",
    fighting: "#C22E28",
    poison: "#A33EA1",
    ground: "#E2BF65",
    flying: "#A98FF3",
    psychic: "#F95587",
    bug: "#A6B91A",
    rock: "#B6A136",
    ghost: "#735797",
    dragon: "#6F35FC",
    dark: "#705746",
    steel: "#B7B7CE",
    fairy: "#D685AD",
  };
  return typeColors[type] || "#777"; // Default fallback color
}

function displayPokemons(pokemonArray) {
  listWrapper.innerHTML = ""; // Leert das Wrapper-Element

  // Fetch detailed data for each Pokémon to get the types
  pokemonArray.forEach((pokemon) => {
    const pokemonID = pokemon.url.split("/")[6]; // Extrahiert die ID des Pokémon aus der URL
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonID}`)
      .then((response) => response.json())
      .then((details) => {
        const types = details.types.map((typeInfo) => typeInfo.type.name);

        const typeBadges = types
          .map(
            (type) =>
              `<span class="type-badge" style="background-color: ${getTypeColor(
                type
              )};">${type}</span>`
          )
          .join(" ");

        const listItem = document.createElement("div"); // Erstellt ein div-Element für das Pokémon
        listItem.className = "list-item"; // Setzt die Klasse für das Styling
        listItem.innerHTML = /*html*/ `
          <div class="number-wrap">
              <p class="caption-fonts headline">#${pokemonID}</p>
          </div>
          <div class="img-wrap">
              <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemonID}.svg" alt="">
          </div>
          <div class="info-wrap">
              <div class="types-wrap">
                  ${typeBadges}
              </div>
              <div class="name-wrap">
                  <p class="body3-fonts headline">${pokemon.name}</p> 
              </div>
          </div>
        `;

        listItem.addEventListener("click", () => {
          openDialog(details);
        });

        listWrapper.appendChild(listItem); // Hinzufügen des Pokémon zur Liste
      })
      .catch((error) =>
        console.error("Failed to fetch detailed Pokemon data:", error)
      ); // Fehlerbehandlung
  });
}

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

function openDialog(details) {
  dialog.innerHTML = `
    <button class="close-button">X</button>
    <div class="dialog-content">
      <h2 class="dialog-name">${details.name.toUpperCase()}</h2>
      <h3 class="dialog-id">#${details.id}</h3>
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${details.id}.svg" alt="${details.name}" class="dialog-img">
      <div class="types-wrap">
        ${details.types.map((typeInfo) => `<span class="type-badge" style="background-color: ${getTypeColor(typeInfo.type.name)};">${typeInfo.type.name}</span>`).join(" ")}
      </div>
      <button class="prev-button"><img src="./assets/arrow-left" alt="Previous"></button>
      <button class="next-button"><img src="./assets/arrow-right" alt="Next"></button>
    </div>
  `;
  dialog.showModal();
  
  const prevButton = dialog.querySelector('.prev-button');
  const nextButton = dialog.querySelector('.next-button');
  const closeButton = dialog.querySelector('.close-button');
  
  prevButton.addEventListener('click', () => showPrevNextPokemon(details.id - 1));
  nextButton.addEventListener('click', () => showPrevNextPokemon(details.id + 1));
  closeButton.addEventListener('click', () => dialog.close());
}


function showPrevNextPokemon(id) {
  if (id < 1 || id > MAX_POKEMON) return; // Grenzen überprüfen
  fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    .then((response) => response.json())
    .then((details) => {
      openDialog(details);
    })
    .catch((error) =>
      console.error("Failed to fetch detailed Pokemon data:", error)
    ); // Fehlerbehandlung
}

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

searchInput.addEventListener("keyup", handleSearch);

function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase(); // Konvertiert den Suchbegriff in Kleinbuchstaben
  if (searchTerm) {
    loadMoreButton.style.display = "none"; // Versteckt den "Load More"-Button bei Suchanfragen
  } else {
    loadMoreButton.style.display =
      allPokemon.length < MAX_POKEMON ? "block" : "none"; // Zeigt den "Load More"-Button nur, wenn noch Pokémon geladen werden können
  }

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
  loadMoreButton.style.display =
    allPokemon.length < MAX_POKEMON ? "block" : "none"; // Zeigt den "Load More"-Button nur, wenn noch Pokémon geladen werden können
}

const toggleFilterPopupEl = document.querySelector(".sort-wrap");
toggleFilterPopupEl.addEventListener("click", toggleFilterPopup);

function toggleFilterPopup() {
  const filterPopupEl = document.querySelector(".filter-wrapper");

  if (filterPopupEl.style.display == "block") {
    filterPopupEl.style.display = "none";
  } else {
    filterPopupEl.style.display = "block";
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
