import { createStore } from 'vuex';
import { message } from "ant-design-vue";
import { listenCart } from "./plugin.js";
import initSqlJs from 'sql.js';

let tempMenu = [];

// 初始化 SQLite 数据库
function initDatabase() {
  return new Promise((resolve, reject) => {
    initSqlJs().then(SQL => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/veg_order.db', true);
      xhr.responseType = 'arraybuffer';

      xhr.onload = function () {
        if (xhr.status === 200) {
          const uInt8Array = new Uint8Array(this.response);
          const db = new SQL.Database(uInt8Array);
          const menu = db.exec("SELECT * FROM menu")[0].values;

          const menuList = menu.map(item => ({
            category: item[6],
            id: item[0],
            name: item[1],
            purchase_price: item[2],
            selling_price: item[4],
            stock: item[3],
            unit: item[5]
          }));

          tempMenu = menuList;
          resolve(db);
        } else {
          reject("Failed to load database");
        }
      };
      xhr.onerror = () => reject("Request failed");
      xhr.send();
    });
  });
}

// 初始化 IndexedDB
function initIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("vegDatabase", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore("menuStore", { keyPath: "id" });
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = () => {
      reject("Failed to open IndexedDB");
    };
  });
}

// 将数据写入 IndexedDB
function saveMenuToIndexedDB(menuData) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("vegDatabase", 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction("menuStore", "readwrite");
      const objectStore = transaction.objectStore("menuStore");

      menuData.forEach(item => {
        objectStore.put(item);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject("Failed to save to IndexedDB");
    };
  });
}

// 从 IndexedDB 获取菜单数据
function getMenuFromIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("vegDatabase", 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction("menuStore", "readonly");
      const objectStore = transaction.objectStore("menuStore");
      const allItems = objectStore.getAll();

      allItems.onsuccess = () => resolve(allItems.result);
      allItems.onerror = () => reject("Failed to get data from IndexedDB");
    };
  });
}

// 从 IndexedDB 删除菜单项
function deleteMenuItemFromIndexedDB(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("vegDatabase", 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction("menuStore", "readwrite");
      const objectStore = transaction.objectStore("menuStore");
      const deleteRequest = objectStore.delete(id);

      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject("Failed to delete item from IndexedDB");
    };
  });
}

// 从 IndexedDB 更新菜单项
function updateMenuItemInIndexedDB(item) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("vegDatabase", 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction("menuStore", "readwrite");
      const objectStore = transaction.objectStore("menuStore");
      const updateRequest = objectStore.put(item);

      updateRequest.onsuccess = () => resolve();
      updateRequest.onerror = () => reject("Failed to update item in IndexedDB");
    };
  });
}

// Vuex Store
const store = createStore({
  state: {
    menu: [],
    cart: [],
    user: new URLSearchParams(window.location.search).get("userid"),
    db: null
  },
  mutations: {
    setDb(state, db) {
      state.db = db;
    },
    setMenu(state, menu) {
      state.menu = menu;
    },
    orderFood(state, [foodid, custom]) {
      const found = state.menu.find(item => item.id === foodid);
      const customList = custom.flatMap(list => list.items.filter(item => item.checked));

      const cartItem = state.cart.find(item => item.id === foodid);
      if (cartItem) {
        cartItem.count++;
        cartItem.custom.push(customList);
      } else {
        const newFood = { ...found, count: 1, custom: [customList] };
        state.cart.push(newFood);
      }
      message.success("已加入購物車");
    },
    removeFood(state, [foodid, key]) {
      const found = state.cart.find(item => item.id === foodid);
      if (found) {
        found.count--;
        if (key) {
          found.custom.splice(key, 1);
        } else {
          found.custom.pop();
        }
        if (found.count === 0) {
          state.cart.splice(state.cart.indexOf(found), 1);
        }
      }
      message.success("移除成功");
    },
    setCart(state, cart) {
      state.cart = cart;
    },
    cleanCart(state) {
      state.cart = [];
    },
    addMenuItem(state, item) {
      state.menu.push(item);
      return updateMenuItemInIndexedDB({
        id: item.id,
        name: item.name,
        purchase_price: 0,
        selling_price: 0,
        stock: 999,
        unit: item.unit,
        category: item.category
      });
    },
    deleteMenuItem(state, id) {
      state.menu = state.menu.filter(item => item.id !== id);
      return deleteMenuItemFromIndexedDB(id);
    },
    updateMenuItem(state, item) {
      const index = state.menu.findIndex(menuItem => menuItem.id === item.id);
      if (index !== -1) {
        state.menu.splice(index, 1, item);
        return updateMenuItemInIndexedDB({
          id: item.id,
          name: item.name,
          purchase_price: 0,
          selling_price: 0,
          stock: 999,
          unit: item.unit,
          category: item.category
        });
      }
    },
    deleteDatabase() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase("vegDatabase");
    
        request.onsuccess = () => {
          resolve("Database deleted successfully");
        };
    
        request.onerror = () => {
          reject("Failed to delete database");
        };
    
        request.onblocked = () => {
          console.warn("Database deletion blocked");
        };
      });
    }
  },
  actions: {
    initializeStore({ commit }) {
      return Promise.all([initDatabase(), initIndexedDB()])
        .then(([db]) => {
          commit('setDb', db);
          return getMenuFromIndexedDB();
        })
        .then(menuFromIndexedDB => {
          if (menuFromIndexedDB.length > 0) {
            commit('setMenu', menuFromIndexedDB);
          } else {
            commit('setMenu', tempMenu);
            return saveMenuToIndexedDB(tempMenu);
          }
        })
        .catch(error => {
          console.error(error);
        });
    }
  },
  getters: {
    findFood(state) {
      return (foodid) => state.menu.find(item => item.id === foodid);
    },
    findCart(state) {
      return (foodid) => state.cart.find(item => item.id === foodid)?.count;
    },
    findCustom(state) {
      return (foodid) => state.cart.find(item => item.id === foodid)?.custom;
    },
    foodCount(state) {
      return state.cart.reduce((total, item) => total + item.count, 0);
    },
    getTotal(state) {
      return state.cart.reduce((total, food) => {
        return total + food.custom.flat().reduce((sum, custom) => sum + custom.selling_price, 0);
      }, 0);
    },
    getAllFood(state) {
      return state.cart.flatMap(item => 
        Array.from({ length: item.count }, (_, key) => ({
          ...item,
          count: undefined,
          custom: item.custom[key],
          key
        }))
      );
    },
    calcPrice() {
      return (item) => item.custom.reduce((total, custom) => total + custom.selling_price, 0);
    }
  },
  plugins: [listenCart]
});

// 立即执行加载数据库
store.dispatch('initializeStore');

export default store;
