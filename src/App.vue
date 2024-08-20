<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">MTG Card Search</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/">Home</router-link>
          </li>
          <!-- Conditional rendering based on user authentication status -->
          <li v-if="!user" class="nav-item">
            <router-link class="nav-link" to="/login">Login</router-link>
          </li>
          <li v-if="!user" class="nav-item">
            <router-link class="nav-link" to="/signup">Signup</router-link>
          </li>
          <li v-if="user" class="nav-item">
            <a href="#" @click="logout" class="nav-link">Logout</a>
          </li>
        </ul>
      </div>
    </nav>

    <router-view />
  </div>
</template>

<script>
import store from '@/store';
import { firebase } from '@/firebase';
import router from '@/router';

export default {
  name: 'app',
  data() {
    return {
      user: null, // Track the user's authentication status
    };
  },
  created() {
    firebase.auth().onAuthStateChanged((user) => {
      const currentRoute = router.currentRoute;
      if (user) {
        this.user = user.email;
        store.currentUser = user.email;
        if (!currentRoute.meta || !currentRoute.meta.needsUser) {
          router.push({ name: 'home' });
        }
      } else {
        this.user = null;
        store.currentUser = false;
        if (currentRoute.meta && currentRoute.meta.needsUser) {
          router.push({ name: 'login' });
        }
      }
    });
  },
  methods: {
    logout() {
      firebase.auth().signOut().then(() => {
        this.$router.push({ name: 'login' });
        this.user = null;
      });
    },
  },
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.navbar {
  padding: 15px;
}

.nav-link {
  font-weight: bold;
  color: #2c3e50;
}

.nav-link.router-link-exact-active {
  color: #42b983;
}
</style>
