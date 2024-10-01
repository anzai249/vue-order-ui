import {createRouter, createWebHistory} from 'vue-router'
import Home from '../views/home/index.vue'
import Checkout from "../views/checkout/index.vue";
import Payment from "../views/payment/index.vue";
import Order from "../views/orders/index.vue"; 

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: Checkout
  },
  {
    path: '/payment',
    name: 'Payment',
    component: Payment
  },
  {
    path: '/order',
    name: 'Order',
    component: Order
  }
]

const router = createRouter({
  mode: 'history',
  history: createWebHistory(),
  routes: routes
})

export default router