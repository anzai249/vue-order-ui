<template>
  <a-config-provider :autoInsertSpaceInButton="false">
    <a-spin :spinning="loading" size="large" tip="下單中...">
      <Topbar />
      <div class="fadeTopbar"></div>
      <router-view v-slot="{ Component }" :style="{ 'overflow-y': !loading || 'hidden' }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </a-spin>
  </a-config-provider>
</template>

<script>
import Topbar from "./components/topbar.vue";
import { message } from "ant-design-vue";
const lc = require('./app/config.json').localStorageName

export default {
  name: "App",
  data() {
    return {
      loading: false,
    }
  },
  components: { Topbar },
  // mounted() {
  //   if (localStorage.getItem(`${lc}-cart`)) {
  //     this.$store.commit("setCart", JSON.parse(localStorage.getItem(`${lc}-cart`)));
  //     restoreMsg();
  //   }
  // },
  methods: {
    startLoading(callback) {
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
        callback();
      }, Math.floor(Math.random() * 2000));
    }
  },
}
</script>

<style lang="less">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fadeTopbar {
  height: 50px;
}

body>#app .ant-spin {
  position: absolute;
  top: 0;
  bottom: 0;
  height: 100vh;
  margin: auto;
  user-select: none;
}
</style>