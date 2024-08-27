<template>
  <div class="deck-creation">
    <header class="deck-creation-header">
      <h1>Edit Deck</h1>
    </header>

    <section class="deck-selection">
      <label for="deckSelect">Select a deck to edit:</label>
      <select id="deckSelect" v-model="selectedDeckId" @change="handleDeckChange">
        <option value="" disabled>Select a deck</option>
        <option v-for="deck in userDecks" :key="deck.id" :value="deck.id">
          {{ deck.title }}
        </option>
      </select>
      <button @click="navigateToProfile" class="return-profile-button">
        Return to Profile
      </button>
    </section>

    <section v-if="currentDeck" class="card-search">
      <input v-model="searchQuery" @input="searchCards" placeholder="Search for cards..." />
      <ul v-if="searchResults.length">
        <li v-for="card in searchResults" :key="card.id" @click="selectCard(card)">
          <img :src="card.image" :alt="card.name" class="card-image" />
          <span>{{ card.name }}</span>
        </li>
      </ul>
    </section>

    <section class="deck-input">
      <div v-for="(card, index) in deckCards" :key="index" class="deck-card">
        <span>{{ card.name }}</span>
        <input v-model.number="card.quantity" type="number" min="1" />
        <button @click="removeCard(index)">Remove</button>
      </div>
    </section>

    <section class="save-deck">
      <button v-if="deckCards.length > 0" @click="saveDeck" class="save-deck-button">
        Update Deck
      </button>
    </section>

    <section v-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
    </section>
  </div>
</template>

<script>
import { firebase } from '@/firebase';

export default {
  name: 'DeckCreation',
  data() {
    return {
      searchQuery: '',
      searchResults: [],
      deckCards: [],
      currentDeck: null,
      selectedDeckId: '',
      userDecks: [], 
      errorMessage: ''
    };
  },
  created() {
    this.fetchUserDecks();
  },
  methods: {
    async fetchUserDecks() {
      try {
        const db = firebase.firestore();
        const userId = firebase.auth().currentUser.uid;
        const decksSnapshot = await db.collection('decks').where('userId', '==', userId).get();
        this.userDecks = decksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error('Error fetching user decks:', error);
        this.errorMessage = 'Error fetching your decks.';
      }
    },

    handleDeckChange() {
      if (this.selectedDeckId) {
        this.loadDeck(this.selectedDeckId);
      }
    },

    async searchCards() {
      if (this.searchQuery.length < 3) {
        this.searchResults = [];
        return;
      }

      try {
        const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(this.searchQuery)}`);
        const data = await response.json();
        this.searchResults = data.data.map(card => ({
          name: card.name,
          id: card.id,
          image: card.image_uris?.small || 'https://via.placeholder.com/100x140',
        }));
      } catch (error) {
        console.error('Error searching cards:', error);
        this.errorMessage = 'Error searching for cards.';
      }
    },

    selectCard(card) {
      const existingCard = this.deckCards.find(c => c.name === card.name);
      if (existingCard) {
        existingCard.quantity += 1;
      } else {
        this.deckCards.push({ name: card.name, quantity: 1 });
      }
      this.searchQuery = '';
      this.searchResults = [];
    },

    removeCard(index) {
      this.deckCards.splice(index, 1);
    },

    async saveDeck() {
      if (this.deckCards.length === 0) {
        this.errorMessage = 'Your deck is empty. Add cards to save.';
        return;
      }

      const db = firebase.firestore();
      const deckContent = this.deckCards.map(card => `${card.quantity} ${card.name}`).join('\n');

      try {
        if (this.currentDeck) {
          await db.collection('decks').doc(this.currentDeck.id).update({
            deckContent,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
          alert('Deck updated successfully!');
          this.resetDeckCreation();
        }
      } catch (error) {
        console.error('Error saving deck:', error);
        this.errorMessage = 'Error saving deck.';
      }
    },

    async loadDeck(deckId) {
      try {
        const db = firebase.firestore();
        const deckSnapshot = await db.collection('decks').doc(deckId).get();

        if (deckSnapshot.exists) {
          const deckData = deckSnapshot.data();
          this.currentDeck = { id: deckId, ...deckData };
          this.deckCards = deckData.deckContent.split('\n').map(line => {
            const [quantity, ...nameParts] = line.split(' ');
            const name = nameParts.join(' ');
            return { name, quantity: parseInt(quantity, 10) };
          });
        } else {
          this.errorMessage = 'Deck not found.';
        }
      } catch (error) {
        console.error('Error loading deck:', error);
        this.errorMessage = `Error loading deck: ${error.message}`;
      }
    },

    resetDeckCreation() {
      this.deckCards = [];
      this.currentDeck = null;
      this.selectedDeckId = '';
      this.fetchUserDecks(); 
    },

    navigateToProfile() {
      this.$router.push({ name: 'profile' });
    }
  }
};
</script>

<style scoped>
.deck-creation {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

.deck-creation-header {
  text-align: center;
  margin-bottom: 20px;
}

.deck-selection {
  margin-bottom: 20px;
}

#deckSelect {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.return-profile-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
  margin-top: 10px;
}

.return-profile-button:hover {
  background-color: #0056b3;
}

.card-search {
  margin-bottom: 20px;
}

input[type="text"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #ddd;
}

li:hover {
  background-color: #f0f0f0;
}

.card-image {
  width: 50px;
  height: 70px;
  margin-right: 10px;
}

.deck-input {
  margin-top: 20px;
}

.deck-card {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.deck-card span {
  flex: 1;
}

.deck-card input[type="number"] {
  width: 60px;
  margin-left: 10px;
}

.save-deck {
  margin-top: 20px;
  text-align: center;
}

.save-deck-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
}

.save-deck-button:hover {
  background-color: #0056b3;
}

.error-message {
  color: red;
  margin-top: 20px;
  text-align: center;
}
</style>
