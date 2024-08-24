<template>
  <div class="profile">
    <header class="profile-header">
      <h1>User Profile</h1>
    </header>

    <section v-if="user" class="user-info">
      <p><strong>Email:</strong> {{ user.email }}</p>
      <button @click="logout" class="logout-button">Logout</button>
    </section>

    <section v-if="user" class="deck-management">
      <div class="deck-select">
        <label for="deckSelect">Choose a deck to display:</label>
        <select id="deckSelect" v-model="selectedDeckId" @change="fetchDeck">
          <option value="" disabled>Select a deck</option>
          <option v-for="deck in userDecks" :key="deck.id" :value="deck.id">
            {{ deck.title }}
          </option>
        </select>
      </div>

      <div class="file-upload">
        <input type="file" @change="handleFileUpload" accept=".txt" />
        <button @click="uploadDeck" class="upload-button">Upload Deck</button>
      </div>
    </section>

    <section v-if="categorizedDeck" class="deck-content">
      <div v-for="(cards, type) in categorizedDeck" :key="type" class="card-type">
        <h4>{{ type }}:</h4>
        <ul>
          <li v-for="card in cards" :key="card" @mouseover="showImage(card)" @mouseleave="hideImage">
            <a :href="cardLinks[card.replace(/^\d+\s+/, '')]" target="_blank" class="card-link">
              {{ card }}
            </a>
          </li>
        </ul>
      </div>
    </section>

    <section v-if="hoveredImage" class="hover-image">
      <img :src="hoveredImage" alt="Card Image" />
    </section>
  </div>
</template>

<script>
import { firebase } from '@/firebase';

export default {
  name: 'Profile',
  data() {
    return {
      user: null,
      deckContent: '',
      categorizedDeck: {
        'Creatures': [],
        'Planeswalkers': [],
        'Lands': [],
        'Sorceries': [],
        'Instants': [],
        'Artifacts': [],
        'Enchantments': []
      },
      userDecks: [],
      selectedDeckId: '',
      cardLinks: {}, 
      cardImages: {}, 
      hoveredImage: null 
    };
  },
  created() {
    this.fetchUser();
    this.fetchUserDecks();
  },
  methods: {
    async fetchUser() {
      const user = firebase.auth().currentUser;
      if (user) {
        this.user = {
          email: user.email
        };
      }
    },

    async fetchUserDecks() {
      const db = firebase.firestore();
      const userId = firebase.auth().currentUser.uid;
      const decksSnapshot = await db.collection('decks').where('userId', '==', userId).get();
      
      this.userDecks = decksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
    
    async fetchDeck() {
      const db = firebase.firestore();
      const deckSnapshot = await db.collection('decks').doc(this.selectedDeckId).get();
      
      if (deckSnapshot.exists) {
        this.deckContent = deckSnapshot.data().deckContent;
        this.categorizeDeck();
      }
    },
    
    logout() {
      firebase.auth().signOut().then(() => {
        this.$router.push({ name: 'login' });
      });
    },
    
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file && file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.deckContent = e.target.result;
          this.categorizeDeck();
        };
        reader.readAsText(file);
      } else {
        alert('Please upload a valid .txt file.');
      }
    },
    
    async uploadDeck() {
      if (this.deckContent) {
        const db = firebase.firestore();
        const userId = firebase.auth().currentUser.uid;
        const deckTitle = prompt('Enter a title for your deck:');

        if (deckTitle) {
          await db.collection('decks').add({
            userId,
            deckContent: this.deckContent,
            title: deckTitle,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then(() => {
            alert('Deck uploaded successfully!');
            this.fetchUserDecks(); 
            this.deckContent = ''; 
          })
          .catch((error) => {
            console.error('Error uploading deck:', error);
          });
        }
      } else {
        alert('Please select a deck file to upload.');
      }
    },
    
    async categorizeDeck() {
      const lines = this.deckContent.split('\n');
      const categorizedDeck = {
        'Creatures': [],
        'Planeswalkers': [],
        'Lands': [],
        'Sorceries': [],
        'Instants': [],
        'Artifacts': [],
        'Enchantments': []
      };

      const cardLinks = {};
      const cardImages = {}; 

      for (const line of lines) {
        const cardWithQuantity = line.trim();
        const cardName = cardWithQuantity.replace(/^\d+\s+/, ''); 

        if (cardName) {
          const { type_line, scryfall_uri, image_uris } = await this.getCardScryfallData(cardName);
          const cardType = this.determineCardType(type_line);
          console.log(`Card: ${cardName}, Type: ${cardType}`); 
          
          cardLinks[cardName] = scryfall_uri;
          cardImages[cardName] = image_uris ? image_uris.normal : '#'; 

          if (categorizedDeck[cardType]) {
            categorizedDeck[cardType].push(cardWithQuantity);
          } else {
            console.warn(`Card type not recognized for card: ${cardName}`);
          }
        }
      }

      this.categorizedDeck = categorizedDeck;
      this.cardLinks = cardLinks;
      this.cardImages = cardImages;
    },
    
    determineCardType(typeLine) {
      if (typeLine.includes('Creature')) return 'Creatures';
      if (typeLine.includes('Planeswalker')) return 'Planeswalkers';
      if (typeLine.includes('Land')) return 'Lands';
      if (typeLine.includes('Sorcery')) return 'Sorceries';
      if (typeLine.includes('Instant')) return 'Instants';
      if (typeLine.includes('Artifact')) return 'Artifacts';
      if (typeLine.includes('Enchantment')) return 'Enchantments';
    },
    
    async getCardScryfallData(cardName) {
      try {
        const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`);
        const cardData = await response.json();

        if (cardData.object === 'card') {
          return {
            type_line: cardData.type_line,
            scryfall_uri: cardData.scryfall_uri,
            image_uris: cardData.image_uris
          };
        } else {
          console.warn(`Card not found: ${cardName}`);
          return {};
        }
      } catch (error) {
        console.error('Error fetching card data:', error);
        return {};
      }
    },
    
    showImage(card) {
      this.hoveredImage = this.cardImages[card.replace(/^\d+\s+/, '')] || null;
    },
    
    hideImage() {
      this.hoveredImage = null;
    }
  }
};
</script>

<style scoped>
.profile {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

.profile-header {
  text-align: center;
  margin-bottom: 20px;
}

.user-info {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.logout-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.logout-button:hover {
  background-color: #0056b3;
}

.deck-management {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.deck-select, .file-upload {
  flex: 1;
  margin-right: 20px;
}

.file-upload {
  display: flex;
  align-items: center;
}

.upload-button {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;
}

.upload-button:hover {
  background-color: #218838;
}

.deck-content {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-between;
}

.card-type {
  flex: 1 1 calc(33% - 20px); 
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-type h4 {
  margin-bottom: 10px;
}

.card-type ul {
  list-style: none;
  padding: 0;
}

.card-type ul li {
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.card-link {
  text-decoration: none;
  color: #007bff;
  font-weight: bold;
}

.card-link:hover {
  text-decoration: underline;
}

.hover-image {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px; /* Larger size */
  height: auto;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.hover-image img {
  width: 100%;
  height: auto;
}
</style>
