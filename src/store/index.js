import { createStore } from 'vuex'
import { message } from "ant-design-vue";
const lc = require('../app/config.json').localStorageName
import restoreMsg from "../function/restoreMsg.js";
// plugin
import { listenCart } from "./plugin.js";
import ExcelJS from 'exceljs';


const store = createStore({
  state: {
    "menu": [
      {
        "category": "水菜",
        "id": "loading0-load-load-load-loadingload0",
        "name": "載入中……",
        "purchase_price": 0,
        "selling_price": 0,
        "stock": '?',
        "unit": "kg"
      },
    ],
    "cart": [],
    "db": null,
    "originalMenu": []
  },
  mutations: {
    orderFood(state, [foodid, custom, quantity]) {
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
      let request = objectStore.add( customer );
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
        price += Number((food.selling_price.result * food.count).toFixed(1));
        food.custom.forEach((customList) => {
          customList.forEach((custom) => {
            price += Number((custom.selling_price.result).toFixed(1));
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
        let price = item.selling_price.result;
        // item.custom.forEach((item) => {
        //   price += item.selling_price.result;
        // })
        return price;
      }
    }
  },
  plugins: [listenCart]
})


fetch('/veg.xlsx')
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => {
    const workbook = new ExcelJS.Workbook();
    return workbook.xlsx.load(arrayBuffer);
  })
  .then(workbook => {
    const sheet = workbook.worksheets[0];
    const data = sheet.getSheetValues();
    const result = data.slice(2).map((item, rowIndex) => ({
      category: getCategoryName(getCategoryColor(sheet, rowIndex + 2)),
      name: item[1], // A列
      selling_price: item[8], // H列
      unit: "kg",
      available: item[2] ? true : false, // 检查B列
      id: rowIndex + 2
    }));
    // 篩出available為true的菜單
    let resultAvailable = result.filter(item => item.available);
    // selling_price.result 四捨五入
    resultAvailable.forEach(item => {
      if (item.selling_price.result) {
        item.selling_price.result = Math.round(item.selling_price.result);
      }
    });
    store.state.menu = resultAvailable;
    store.state.originalMenu = resultAvailable;
    if (localStorage.getItem(`${lc}-cart`)) {
      let storageCart = JSON.parse(localStorage.getItem(`${lc}-cart`));
      // 按照name重新計算價格
      storageCart.forEach((item) => {
        let found = resultAvailable.find((food) => food.name === item.name);
        if (found) {
          item.selling_price = found.selling_price;
        }
      });
      localStorage.setItem(`${lc}-cart`, JSON.stringify(storageCart));
      store.commit('setCart', storageCart);
      restoreMsg();
    }
  })
  .catch(error => {
    console.error("Error loading file:", error);
  });

function getCategoryColor(sheet, rowIndex) {
  const cell = sheet.getCell(`A${rowIndex}`); // A列
  const fill = cell.style.fill;
  // 检查是否有填充样式
  if (fill && fill.fgColor) {
    return fill.fgColor.theme || fill.fgColor.argb;
  }
  return 'default';
}

// FFFFFF00 - 大菜
// 5 - 豆類菇類小包菜
// 9 - 水菜
// 4 - 根莖類
function getCategoryName(color) {
  switch (color) {
    case 'FFFFFF00':
      return '大菜';
    case 5:
      return '豆類菇類小包菜';
    case 9:
      return '水菜';
    case 4:
      return '根莖類';
    default:
      return '其他';
  }
}

// create a customer info db using indexedDB
let db;
let request = indexedDB.open("customer", 1);
request.onerror = function (event) {
  console.log("error: ");
};
request.onsuccess = function (event) {
  db = event.target.result;
  store.state.db = db;
  // get all customer info
  let transaction = db.transaction(["customer"], "readwrite");
  let objectStore = transaction.objectStore("customer");
  let request_ = objectStore.getAll();
  request_.onsuccess = function (event) {
    localStorage.setItem("customer", JSON.stringify(event.target.result));
  };
};
request.onupgradeneeded = function (event) {
  db = event.target.result;
  let objectStore = db.createObjectStore("customer", {
    key
      : "id", autoIncrement: true
  });
  objectStore.createIndex("info", "info", { unique: false });
  objectStore.add({
    label: '空模板',
    value: JSON.stringify({
      name: '',
      phone: '',
      address: '',
      customerid: '',
      operatorName: '',
      invoiceTitle: '',
    })
  });
}

export default store