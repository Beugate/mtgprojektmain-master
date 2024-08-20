<template>
  <div class="login">
    <h1>This is a login page</h1>
    <div class="container">
      <div class="row">
        <div class="col-sm"></div>
        <div class="col-sm">
          <form>
            <div class="form-group">
              <label>Email address</label>
              <input
                type="email"
                v-model="email"
                class="form-control"
                placeholder="Enter email"
              />
              <small class="form-text text-muted">
                We'll never share your email with anyone else.
              </small>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input
                type="password"
                v-model="password"
                class="form-control"
                placeholder="Password"
              />
            </div>
            <button
              type="button"
              @click="login"
              class="btn btn-primary"
            >
              Submit
            </button>
          </form>
        </div>
        <div class="col-sm"></div>
      </div>
    </div>
  </div>
</template>

<script>
import {firebase} from '@/firebase';

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
    };
  },
  methods: {
    login() {
      console.log('login..', this.email);
      firebase.auth().signInWithEmailAndPassword(this.email, this.password)
        .then((result) => {
          console.log('Successful login', result);
          
        })
        .catch((error) => {
          console.error('Error', error);
        });
    },
  },
};
</script>
