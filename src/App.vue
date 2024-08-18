<template>
  <div id="app">
 <div id="nav">
 <router-link to="/">Home</router-link> |
 <router-link to="/login">Login</router-link>
  <router-link to="/signup">Signup</router-link>
  <a href ="#" @click="logout()" class="nav-link">Lougout</a>

 </div>
 <router-view/>
 </div>
</template>

<script>
import store from '@/store';
import {firebase} from '@/firebase';

firebase.auth().onAuthStateChanged((user) =>{
      
      if (user) {
          //user signed in.
          console.log(user.email);

      } else {
          //user is not signed in.
          console.log('no user');
      }
}   )

export default {
  name:'app',
  data () {
    return {store};
  },

  methods: {
    logout() {
        firebase.auth().signOut().then(() => {
          this.$router.push({name:'login'})
        });
      }
  }


}
</script>


<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
