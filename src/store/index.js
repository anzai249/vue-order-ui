import { createStore } from 'vuex'
import { message } from "ant-design-vue";
const lc = require('../app/config.json').localStorageName
// plugin
import { listenCart } from "./plugin.js";
import menu from "../app/menu.json"

// give id
let id = 1
menu.forEach(item => {
  item.id = id++
})

// indexedDB
let db;
let request2 = indexedDB.open("customer", 1);
request2.onerror = function (event) {
  console.log("error: ");
};
request2.onsuccess = function (event) {
  db = request2.result;
  console.log("success: " + db);
};
request2.onupgradeneeded = function (event) {
  db = event.target.result;
  let objectStore = db.createObjectStore("customer", {
    key
      : "id", autoIncrement: true
  });
  objectStore.createIndex("info", "info", { unique: false });
}

const store = createStore({
  state: {
    "menu": menu,
    "cart": [],
    "db": null,
    "originalMenu": menu,
  },
  mutations: {
    orderFood(state, [foodid, custom, quantity, singlePrice, singleUnit]) {
      // if out of stock
      let found = state.menu.map((item) => item).flat().find((item) => item.id === foodid);
      // custom edit
      const customList = []
      custom.forEach(list => {
        list.items.forEach(item => {
          if (item.checked) {
            customList.push(item)
          }
        })
      })
      // found in cart
      found = state.cart.find((item) => item.id === foodid);
      if (found) {
        found.count += quantity;
        found.custom.push(customList)
      } else {
        // not found in cart
        // found menu from getters
        let food = this.getters.findFood(foodid);
        let newFood = JSON.parse(JSON.stringify(food));
        newFood.count = quantity;
        newFood.selling_price = singlePrice;
        newFood.unit = singleUnit;
        newFood.custom = [customList];
        state.cart.push(newFood);
      }
      message.success("已加入購物車")
    },
    removeFood(state, [foodid, key]) {
      let found = state.cart.find((item) => item.id === foodid);
      if (found) {
        found.count = 0;
        if (key)
          found.custom.splice(key, 1)
        else
          found.custom.pop()
        if (found.count === 0) {
          state.cart.splice(state.cart.indexOf(found), 1)
        }
      }
      message.success("移除成功")
    },
    setCart(state, cart) {
      state.cart = cart
    },
    cleanCart(state) {
      state.cart = []
    },
    addCustomer(state, customer) {
      let transaction = db.transaction(["customer"], "readwrite");
      let objectStore = transaction.objectStore("customer");
      let request = objectStore.add(customer);
      request.onsuccess = function (event) {
        console.log("customer added to db")
      };
    },
    setMenu(state, menu) {
      state.menu = menu
    }
  },
  actions: {},
  getters: {
    findFood(state) {
      // found in menu
      return (foodid) => {
        return state.menu.map((item) => item).flat().find((item) => item.id === foodid);
      }
    },
    findCart(state) {
      // found in cart
      return (foodid) => {
        return state.cart.find((item) => item.id === foodid)?.count;
      }
    },
    foodCount(state) {
      // found in cart.count
      return state.cart.map((item) => item.count).reduce((a, b) => a + b, 0);
    },
    findType(state) {
      return (foodid) => {
        // return state.menu.name
        return state.menu.find((item) => item.items.find((item) => item.id === foodid));
      }
    },
    getTotal(state) {
      let price = 0;
      state.cart.forEach((food) => {
        price += Number((food.selling_price * food.count).toFixed(1));
        food.custom.forEach((customList) => {
          customList.forEach((custom) => {
            price += Number((custom.selling_price).toFixed(1));
          })
        })
      })
      return Number(price);
    },
    getAllFood(state) {
      // get cart
      let cart = state.cart;
      let foodList = []
      cart.forEach((item) => {
        let key = 0
        // for item.count
        for (let i = 0; i < item.count; i++) {
          let newItem = JSON.parse(JSON.stringify(item));
          newItem.count = undefined;
          newItem.custom = item.custom[i];
          newItem.key = key;
          foodList.push(newItem);
          key++;
        }
      })
      return cart;
    },
    calcPrice() {
      return (item) => {
        let price = item.selling_price;
        // item.custom.forEach((item) => {
        //   price += item.selling_price;
        // })
        return price;
      }
    }
  },
  plugins: [listenCart]
})
export default store