// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import store from "@/store";
import profile from '../views/Profile.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
        needsUser: true,
    },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "login" */ '../views/Login.vue')
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import(/* webpackChunkName: "signup" */ '../views/Signup.vue')
  },

  {
    path: '/profile',
    name: 'profile',
    component: profile,
    meta: { requiresAuth: true } 
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,


})

router.beforeEach(( to, from, next) =>{
  console.log("stara ruta", from.name, "nova ruta", to.name, "korisnik", store.currentUser)

  const noUser = store.currentUser === null;

  if (noUser && to.meta.needsUser){

      next('login')
  } else{
      next();
  }

  next ();
} );

export default router
