<template>
  <div id="topbar">
    <div class="left">
      <menu-unfold-outlined class="icon" @click="openDraw"/>
      <a-drawer :width="280" title="分類" :visible="drawerVisible" @close="drawerVisible = !1" :closable="false"
                placement="left">
        <a-menu mode="inline">
          <!-- <a-sub-menu>
            <template #title>
              分類
            </template>
            <a-menu-item v-for="key in ['水菜', '大菜', '根莖類', '豆類菇類小包菜']" :key="key">
              <router-link to="/" @click="scrollTo('foodItem_'+key)">{{ key }}</router-link>
            </a-menu-item>
          </a-sub-menu> -->
          <a-menu-item key="1">
            <router-link to="/order">我的訂單</router-link>
          </a-menu-item>
          <a-menu-item key="4">
            <router-link to="/checkout">購物車</router-link>
          </a-menu-item>
        </a-menu>
      </a-drawer>
      <router-link to="/">
        <a class="logo">
          <img class="logo" :src="config.shop.icon" alt="Logo" v-if="config.shop.icon">
          <span class="logo" v-else>{{ config.shop.name }}</span>
        </a>
      </router-link>
    </div>
    <div class="right">
      <router-link to="/order">
        <FileSearchOutlined class="icon" /> 
      </router-link>
      <router-link to="/checkout">
        <a-badge :count="$store.getters.foodCount">
          <shopping-cart-outlined class="icon"/>
        </a-badge>
      </router-link>
    </div>
  </div>
</template>

<script>
import {MenuUnfoldOutlined, ShoppingCartOutlined, FileSearchOutlined} from '@ant-design/icons-vue'
// import {selecter as $} from "jsfast"

export default {
  name: "topbar",
  data() {
    return {
      config: require("../app/config.json"),
      drawerVisible: false
    }
  },
  mounted() {
  },
  methods: {
    openDraw() {
      this.drawerVisible = !0
    },
    scrollTo(itemId) {
      const targetTop = $(`#foodItem_${itemId}`).el().offsetTop
      // smooth scroll
      window.scrollTo({
        top: targetTop - 50,
        behavior: "smooth"
      })
    }
  },
  components: {
    MenuUnfoldOutlined,
    ShoppingCartOutlined,
    FileSearchOutlined
  }
}
</script>

<style lang="less" scoped>
#topbar {
  background-color: var(--theme-color);
  color: var(--theme-color-text);
  height: 50px;
  position: fixed;
  width: 100%;
  z-index: 10;

  .left, .right {
    float: left;
    display: flex;
    align-items: center;
    height: 100%;
    padding: 20px;

    &.left > * {
      margin-left: 8px;
      padding: 0 4px;
    }

    &.right > * {
      margin-right: 8px;
      padding: 0 4px;
    }

    .logo {
      font-size: 20px;
      font-weight: bold;
      user-select: none;
      margin-bottom: 4px;
      color: var(--theme-color-text);
    }

    .icon {
      font-size: 20px;
      color: var(--theme-color-text);
      cursor: pointer;
    }

    ~ .right {
      float: right;
    }
  }
}
</style>