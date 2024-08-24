<template>
  <div class="home">
    <div class="profile-link" v-if="user">
      <router-link to="/Profile">Go to Profile</router-link>
    </div>

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

    <div class="card-list">
      <div 
        v-if="searchResults.length === 0 " 
        class="no-results"
      >
        No cards found for "{{ searchQuery }}". Please try another search.
      </div>

      <a 
        v-for="card in searchResults" 
        :key="card.id" 
        :href="card.scryfall_uri" 
        target="_blank"
        class="card"
      >
        <img 
          v-if="card.image_uris"
          :src="card.image_uris.normal" 
          alt="Card image" 
          class="card-image"
        />
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
import { firebase } from '@/firebase';

export default {
  name: 'Home',
  data() {
    return {
      searchQuery: '',
      searchResults: [],
      user: null, 
    };
  },
  created() {
    this.checkAuthStatus();
  },
  methods: {
    async checkAuthStatus() {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          this.user = user;
        } else {
          this.user = null;
        }
      });
    },
    async searchCard() {
      const query = this.searchQuery.trim();
      if (query) {
        try {
          const response = await fetch(`https://api.scryfall.com/cards/search?q=${query}`);
          const data = await response.json();
          this.searchResults = data.data || []; 
        } catch (error) {
          console.error('Error searching for card:', error);
          this.searchResults = []; 
        }
      } else {
        this.searchResults = []; 
      }
    },
    resetSearchResults() {
      this.searchResults = [];
    }
  },
};
</script>

<style scoped>
.profile-link {
  position: absolute;
  top: 20px;
  right: 20px;
  font-weight: bold;
}

.profile-link a {
  color: #42b983;
  text-decoration: none;
}

.profile-link a:hover {
  text-decoration: underline;
}

.home {
  position: relative;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

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

.card-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  width: 100%;
}

.card {
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 200px;
  text-align: left;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.card-image {
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

.no-results {
  margin-top: 20px;
  font-size: 1.2em;
  color: #ff6666;
}
</style>
