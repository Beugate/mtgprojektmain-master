<template>
  <div class="manual-deck-creation">
    <header>
      <h1>Manual Deck Creation</h1>
      <button @click="goBack" class="back-button">Back to Profile</button>
    </header>

    <section>
      <h2>Create a New Deck</h2>
      <div>
        <label for="newDeckTitle">Deck Title:</label>
        <input type="text" id="newDeckTitle" v-model="newDeckTitle" placeholder="Enter deck title" />
      </div>

      <div class="search-and-add">
        <label for="cardSearch">Search for a card:</label>
        <input
          type="text"
          id="cardSearch"
          v-model="searchQuery"
          placeholder="Search for a card"
          @input="searchCards"
        />
        <div v-if="searchResults.length > 0" class="search-results">
          <div v-for="card in searchResults" :key="card.id" class="card-result">
            <img :src="card.image_uris.normal" alt="Card Image" />
            <div class="card-info">
              <h3>{{ card.name }}</h3>
              <p>{{ card.type_line }}</p>
              <div class="quantity-controls">
                <button @click="adjustCardQuantity(card.name, -1)">-</button>
                <input
                  type="number"
                  :value="cardQuantities[card.name] || 0"
                  readonly
                />
                <button @click="adjustCardQuantity(card.name, 1)">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="selected-cards">
        <h3>Cards in Deck:</h3>
        <ul>
          <li v-for="(quantity, cardName) in selectedCards" :key="cardName">
            {{ quantity }} x {{ cardName }}
            <button @click="removeCardFromDeck(cardName)">Remove</button>
          </li>
        </ul>
      </div>

      <button @click="saveDeck" class="save-deck-button">Save Deck</button>
    </section>
  </div>
</template>

<script>
import { firebase } from '@/firebase';

export default {
  name: 'ManualDeckCreation',
  data() {
    return {
      newDeckTitle: '',
      searchQuery: '',
      searchResults: [],
      selectedCards: {},
      cardQuantities: {},
    };
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'profile' });
    },
    searchCards() {
      // Fetch card data from an API like Scryfall based on the searchQuery
      // Example: Fetch the search results from Scryfall API and update searchResults
    },
    adjustCardQuantity(cardName, change) {
      const currentQuantity = this.cardQuantities[cardName] || 0;
      const newQuantity = currentQuantity + change;

      if (newQuantity >= 0 && newQuantity <= 4) {
        this.$set(this.cardQuantities, cardName, newQuantity);

        if (newQuantity > 0) {
          this.$set(this.selectedCards, cardName, newQuantity);
        } else {
          this.$delete(this.selectedCards, cardName);
        }
      }
    },
    removeCardFromDeck(cardName) {
      this.$delete(this.selectedCards, cardName);
      this.$delete(this.cardQuantities, cardName);
    },
    async saveDeck() {
      if (!this.newDeckTitle) {
        alert('Please enter a deck title.');
        return;
      }

      const db = firebase.firestore();
      const userId = firebase.auth().currentUser.uid;

      const deckContent = Object.entries(this.selectedCards)
        .map(([cardName, quantity]) => `${quantity} ${cardName}`)
        .join('\n');

      await db.collection('decks')
        .add({
          userId,
          deckContent,
          title: this.newDeckTitle,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
          alert('Deck saved successfully!');
          this.$router.push({ name: 'profile' });
        })
        .catch((error) => {
          console.error('Error saving deck:', error);
        });
    },
  },
};
</script>

<style scoped>
/* Add your CSS styling here */

.manual-deck-creation {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.back-button:hover {
  background-color: #0056b3;
}

.search-results {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.card-result {
  display: flex;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: calc(33% - 20px);
}

.card-info {
  margin-left: 20px;
}

.quantity-controls {
  display: flex;
  align-items: center;
}

.quantity-controls button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.quantity-controls input {
  width: 40px;
  text-align: center;
  margin: 0 10px;
}

.selected-cards {
  margin-top: 20px;
}

.save-deck-button {
  background-color: #28a745;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.save-deck-button:hover {
  background-color: #218838;
}
</style>
