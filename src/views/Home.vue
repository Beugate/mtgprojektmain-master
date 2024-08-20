<template>
  <div class="home">
    <!-- Search Bar -->
    <div class="search-bar">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Search for an MTG card..."
        @input="resetSearchResults" 
        class="search-input"
      />
      <button @click="searchCard" class="search-button">Search</button>
    </div>

    <!-- Search Results -->
    <div class="card-list">
      <!-- Display message only if search has been made and no results are found -->
      <div 
        v-if="searchMade && searchQuery && (!searchResults || searchResults.length === 0)" 
        class="no-results"
      >
        No cards found for "{{ searchQuery }}". Please try another search.
      </div>

      <!-- Ensure searchResults is an array before rendering -->
      <a 
        v-for="card in (searchResults || [])" 
        :key="card.id" 
        :href="card.scryfall_uri" 
        target="_blank"
        class="card"
      >
        <!-- Handle normal cards -->
        <img 
          v-if="card.image_uris"
          :src="card.image_uris.normal" 
          alt="Card image" 
          class="card-image"
        />

        <!-- Handle multi-faced cards -->
        <template v-else-if="card.card_faces">
          <img 
            v-for="face in card.card_faces" 
            :key="face.name" 
            :src="face.image_uris.normal" 
            alt="Card face image"
            class="card-image"
          />
        </template>

        <div class="card-info">
          <h3>{{ card.name }}</h3>
          <p><strong>Set:</strong> {{ card.set_name }}</p>
          <p><strong>Mana Cost:</strong> {{ card.mana_cost || 'N/A' }}</p>
          <p><strong>Type:</strong> {{ card.type_line }}</p>
        </div>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      searchQuery: '',
      searchResults: [],
      searchMade: false,  // Track if search has been made
    };
  },
  methods: {
    async searchCard() {
      const query = this.searchQuery.trim();
      if (query) {
        try {
          const response = await fetch(`https://api.scryfall.com/cards/search?q=${query}`);
          const data = await response.json();
          this.searchResults = data.data || [];  // Ensure searchResults is always an array
        } catch (error) {
          console.error('Error searching for card:', error);
          this.searchResults = [];  // Reset to an empty array on error
        }
      } else {
        this.searchResults = [];  // Reset if query is empty
      }
      this.searchMade = true;  // Indicate that a search has been made
    },
    resetSearchResults() {
      this.searchResults = [];  // Reset results on input change
      this.searchMade = false;  // Reset search flag on input change
    }
  }
}
</script>

<style scoped>
/* General Layout */
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

/* Search Bar Styling */
.search-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  width: 100%;
  max-width: 600px;
}

.search-input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px 0 0 4px;
  font-size: 16px;
}

.search-button {
  padding: 10px 20px;
  border: 1px solid #42b983;
  border-left: none;
  background-color: #42b983;
  color: white;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-size: 16px;
}

.search-button:hover {
  background-color: #36a76c;
}

/* Card List Styling */
.card-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  width: 100%;
}

.card {
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 180px; /* Reduce the width to make the cards smaller */
  text-align: left;
  text-decoration: none;
  color: inherit;
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.card-image {
  width: 100%;
  height: auto;
  border-bottom: 1px solid #ccc; /* Add a border between the image and the text */
}

.card-info {
  padding: 10px;
  font-size: 0.9em; /* Reduce the font size for the card info */
}

.card-info h3 {
  margin: 5px 0;
  font-size: 1em; /* Adjust the font size of the card name */
}

.card-info p {
  margin: 5px 0;
}

/* No Results Styling */
.no-results {
  margin-top: 20px;
  font-size: 1.2em;
  color: #ff6666;
}
</style>
