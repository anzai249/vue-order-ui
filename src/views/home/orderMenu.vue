<template>
  <div id="menu">
    <div class="filter">
      <a-radio-group size="large" v-model:value="typeFilter" button-style="solid">
        <a-radio-button value="水菜">水菜</a-radio-button>
        <a-radio-button value="大菜">大菜</a-radio-button>
        <a-radio-button value="根莖類">根莖類</a-radio-button>
        <a-radio-button value="豆類菇類小包菜">豆類菇類小包菜</a-radio-button>
      </a-radio-group>
    </div>
    <div class="block" v-for="key in ['水菜', '大菜', '根莖類', '豆類菇類小包菜']" v-show="typeFilter === key"
      :id="`foodItem_${key}`">
      <span class="title">
        {{ key }}
      </span>
      <a-list class="itemList">
        <a-list-item v-for="item in $store.state.menu" :key="item.id" v-show="item.category === key && !!item.stock">
          <a-list-item-meta :title="item.name">
            <template #description>
              <!-- <a-space>
                <div class="priceGroup">
                  <span style="color: red">NT$ {{ item.selling_price }}</span>
                  <span>/{{ item.unit }}</span>
                </div>
                <span>庫存 {{ item.stock }}{{ item.unit }}</span>
              </a-space> -->
            </template>
            <!-- <template #avatar v-if="item.img">
              <a-image :src="item.img" alt="img" class="foodImage"/>
            </template> -->
          </a-list-item-meta>
          <a-space>
            <a-button type="primary" v-if="$store.getters.findCart(item.id) > 0"
              @click="$store.commit('removeFood', [item.id])" shape="circle">
              <template #icon>
                <MinusOutlined style="font-size: 11px" />
              </template>
            </a-button>
            <a-button type="primary" @click="viewFood(item.id)" shape="round"
              v-if="item.id !== 'loading0-load-load-load-loadingload0'">
              {{ $store.getters.findCart(item.id) > 0 ? $store.getters.findCart(item.id) : "加入購物車" }}
            </a-button>
          </a-space>
        </a-list-item>
      </a-list>
    </div>
    <a-modal v-model:visible="view">
      <template #title>
        加入購物車
      </template>
      <div class="foodInfo">
        <!-- <img :src="viewTarget.img" alt="img" class="foodImage"> -->
        <div class="foodInfoText">
          <span class="foodName">{{ viewTarget.name }}</span>
        </div>
      </div>
      <div class="custom">
        <div class="type" v-for="type in viewCustom">
          <span class="typeTitle">{{ type.name }}</span>
          <a-button :type="option.checked ? `primary` : undefined" v-for="option in type.items" :key="option.id"
            :value="option.id" shape="round" class="typeItem" @click="option.checked = !option.checked">
            {{ option.name }}
            <span class="customPrice">
              {{ option.selling_price ? `&nbsp;\$${option.selling_price}` : "" }}
            </span>
          </a-button>
        </div>
        <div class="custom-price">
          <span>單價</span>
          <a-input v-model:value="priceSingle" :disabled="isPriceInputDisabled" />
        </div>
      </div>
      <template #footer>
        <div class="price" style="float: left">
          <span class="priceText">NT$ {{ getPrice() }}</span>
        </div>
        <a-space>
          <a-button type="primary" v-if="$store.getters.findCart(viewTarget.id) > 0"
            @click="$store.commit('removeFood', [viewTarget.id])" shape="circle">
            <template #icon>
              <MinusOutlined style="font-size: 11px" />
            </template>
          </a-button>
          <a-button type="primary" @click="orderFood(viewTarget.id)" shape="round">
            {{ $store.getters.findCart(viewTarget.id) > 0 ?
              $store.getters.findCart(viewTarget.id) : "加入購物車" }}
          </a-button>
        </a-space>
      </template>
    </a-modal>
  </div>
</template>

<script>
import { MinusOutlined } from '@ant-design/icons-vue'
import { message } from "ant-design-vue";

export default {
  name: "orderMenu",
  data() {
    return {
      view: false,
      viewTarget: null,
      viewCustom: [],
      typeFilter: "水菜",
      priceSingle: null,
      isPriceInputDisabled: false
    }
  },
  methods: {
    orderFood(foodid) {
      if (!this.priceSingle) {
        message.error("請輸入單價");
        return;
      }
      if (this.priceSingle <= 0) {
        message.error("單價需大於0");
        return;
      }
      this.viewCustom.push({
        items: [{
          id: "price",
          name: "單價",
          selling_price: Number(this.priceSingle),
          checked: true
        }]
      });
      let viewCustom = JSON.parse(JSON.stringify(this.viewCustom));
      this.$store.commit("orderFood", [foodid, viewCustom]);
      this.$forceUpdate()
      this.priceSingle = null;
      this.view = false;
      this.viewCustom = [];
    },
    viewFood(foodid) {
      console.log(this.$store.getters.findCustom(foodid));
      if (this.$store.getters.findCart(foodid) > 0) {
        this.$store.commit("orderFood", [foodid,
          [{
            items: this.$store.getters.findCustom(foodid)[0]
          }]
        ]);
        return;
      }
      this.view = true;
      this.viewTarget = this.$store.getters.findFood(foodid);
      this.viewTarget = JSON.parse(JSON.stringify(this.viewTarget));
      // const childList = this.$store.getters.findType(foodid).superChild || [];
      // get all viewCustom[].items
      // this.viewCustom.child?.forEach(type => {
      //   type.items.forEach(item => {
      //     item.checked = item.default || false;
      //   })
      // });
      // merge this.viewTarget.child and childList
      // get all viewTarget.child
      // this.viewTarget.child?.forEach(type => {
      //   childList.push(type);
      //   type.items.forEach(item => {
      //     item.checked = item.default || false;
      //   })
      // })
      // deep copy
      // this.viewCustom = JSON.parse(JSON.stringify(childList));
      // console.log(this.viewCustom);
    },
    getPrice() {
      return this.priceSingle;
    }
  },
  components: {
    MinusOutlined
  }
}
</script>

<style lang="less">
#menu {
  margin-top: 10px;
  display: block;

  .filter {
    margin-bottom: 10px;
    display: flex;
    justify-content: center;
  }

  .block {
    padding: 0 10px;

    .title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 10px;
      border-bottom: 1px solid #ccc;
      display: block;
      padding: 5px;
    }

    .itemList {
      margin-bottom: 10px;

      .foodImage {
        width: 50px;
        height: 50px;
        object-fit: cover;
        border-radius: 10px
      }
    }
  }
}

.foodInfo {
  .foodImage {
    // cut to 1:1
    width: 100%;
    object-fit: cover;
  }

  .foodInfoText {
    margin-top: 10px;
    display: flex;

    .foodName {
      font-size: 20px;
      font-weight: bold;
    }
  }
}

.custom {
  margin-top: 10px;

  .type {
    margin-bottom: 10px;

    .typeTitle {
      border-bottom: 1px solid #ccc;
      color: #ccc;
      font-size: 16px;
      padding: 4px;
      display: block;
      margin-bottom: 8px;
      user-select: none;
    }

    .typeItem {
      margin-right: 8px;
      margin-bottom: 8px;
    }

    .customPrice {
      color: #ccc;
      font-size: 12px;
    }
  }

  .custom-price {
    margin-top: 10px;
    display: flex;
    gap: 10px;
    align-items: center;

    input {
      width: 80%;
      min-width: 100px;
    }
  }
}

.price {
  .priceText {
    font-size: 16px;
    font-weight: 500;
    color: red;
  }
}
</style>