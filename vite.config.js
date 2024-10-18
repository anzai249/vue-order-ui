import vue from '@vitejs/plugin-vue'
import { viteRequire } from 'vite-require'

export default {
  "plugins": [
    vue(),
    viteRequire({ fileRegex: /(.js|.ts|.vue)$/ }),
  ],
  "base": "./",
  "css": {
    "preprocessorOptions": {
      "less": {
        "javascriptEnabled": true
      }
    }
  },
}