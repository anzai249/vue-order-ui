import {createStore} from 'vuex'
import {message} from "ant-design-vue";

// plugin
import {listenCart} from "./plugin.js";

// import menu from "../app/menu.json"

// give id
// let id = 1
// menu.forEach(item => {
//   item.items.forEach(item => {
//     item.id = id++
//     if (!item.img.includes("http")) {
//       item.img = require("../app/img/" + item.img)
//     }
//   })
// })


fetch("https://linebot.otakux.org/api/menu/",
  {method: "GET", headers: {"Content-Type": "application/json"}}
).then(res => res.json()).then(res => {
  store.state.menu = res
});

const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);
if (!params.get("userid")) {
  message.error("無法獲取用戶ID，請回到LINE重新點擊");
}

const store = createStore({
  state: {
    "menu": [
      {
        "category": "水菜",
        "id": "loading0-load-load-load-loadingload0",
        "name": "載入中……",
        "purchase_price": 0,
        "selling_price": 0,
        "stock": 0,
        "unit": "kg"
      },
    ],
    "cart": [],
    "user": params.get("userid")
  },
  mutations: {
    orderFood(state, [foodid, custom]) {
      // if out of stock
      let found = state.menu.map((item) => item).flat().find((item) => item.id === foodid);
      // if count more than stock
      if (found.stock < state.cart.find((item) => item.id === foodid)?.count + 1) {
        message.error("超出庫存")
        return
      }
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
        found.count++;
        found.custom.push(customList)
      } else {
        // not found in cart
        // found menu from getters
        let food = this.getters.findFood(foodid);
        let newFood = JSON.parse(JSON.stringify(food));
        newFood.count = 1;
        newFood.custom = [customList];
        state.cart.push(newFood);
      }
      message.success("已加入購物車")
    },
    removeFood(state, [foodid, key]) {
      let found = state.cart.find((item) => item.id === foodid);
      if (found) {
        found.count--;
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
        price += food.selling_price * food.count;
        food.custom.forEach((customList) => {
          customList.forEach((custom) => {
            price += custom.selling_price;
          })
        })
      })
      return price;
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
      return foodList;
    },
    calcPrice() {
      return (item) => {
        let price = item.selling_price;
        item.custom.forEach((item) => {
          price += item.selling_price;
        })
        return price;
      }
    }
  },
  plugins: [listenCart]
})

export default store