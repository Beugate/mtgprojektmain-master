<template>
  <div class="home">
    <!-- Search Bar -->
    <div class="search-bar">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Search for an MTG card..."
        @input="resetSearchResults" 
      />
      <button @click="searchCard">Search</button>
    </div>

    <!-- Search Results -->
    <div class="card-list">
      <!-- Display message only if search has been made -->
      <div 
        v-if="searchMade && searchQuery && (!searchResults || searchResults.length === 0)" 
        class="no-results"
      >
        No cards found for "{{ searchQuery }}". Please try another search.
      </div>

      <!-- Use v-if to ensure searchResults is an array before accessing its length -->
      <a 
        v-for="card in (searchResults || [])" 
        :key="card.id" 
        :href="card.scryfall_uri" 
        target="_blank"
        class="card"
      >
        <img 
          :src="card.image_uris?.small" 
          alt="Card image" 
          v-if="card.image_uris"
        />
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
.card-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.card {
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 200px;
  text-align: left;
  text-decoration: none; /* Remove underline from the link */
  color: inherit; /* Ensure text color is inherited */
}

.card img {
  width: 100%;
  height: auto;
}

.card-info {
  padding: 10px;
}

.card-info h3 {
  margin: 10px 0;
  font-size: 1.2em;
}

.card-info p {
  margin: 5px 0;
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add a hover effect */
}

.no-results {
  margin-top: 20px;
  font-size: 1.2em;
  color: #ff6666;
}
</style>

