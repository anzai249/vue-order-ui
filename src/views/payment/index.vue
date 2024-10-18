<template>
  <div id="payment">
    <div class="main">
      <div class="route">
        <router-link :to="{
          name: 'Home',
          query: { userid: this.$store.state.user }
        }">
          <left-outlined style="margin-right: 5px"/>
        </router-link>
        購物車
      </div>
      <a-list class="itemList"
              :pagination="{position: 'bottom', pageSize: 5, showSizeChanger: false, showQuickJumper: true, total: $store.getters.getAllFood.length}"
              :data-source="$store.getters.getAllFood">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta :title="item.name">
              <template #description>
                <span style="color: red;display: block">NT$ {{ $store.getters.calcPrice(item) }}</span>
                <span style="color: gray;display: block" v-for="custom in item.custom" :key="custom.id">
               - {{ custom.name }}
            </span>
              </template>
              <template #avatar v-if="item.img">
                <!-- <a-image :src="item.img" alt="img" class="foodImage"/> -->
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
      <div class="payment-box">
        <div class="route">
          客戶資訊
        </div>
        <div class="payment">
          <a-input placeholder="客戶代號" v-model:value="customerid" style="margin-bottom: 10px"/>
          <a-input placeholder="客戶名稱" v-model:value="name" style="margin-bottom: 10px"/>
          <a-input placeholder="客戶電話" v-model:value="phone" style="margin-bottom: 10px"/>
          <a-input placeholder="客戶地址" v-model:value="address" style="margin-bottom: 10px"/>
          <a-input placeholder="業務人名" v-model:value="operatorName" style="margin-bottom: 10px"/>
          <a-input placeholder="發票抬頭" v-model:value="invoiceTitle" style="margin-bottom: 10px"/>
          <a-input placeholder="備注" v-model:value="note" style="margin-bottom: 10px"/>
        </div>
        <!-- <a-radio-group v-model:value="payment" class="payment">
          <a-radio :style="{display: 'flex', height: '30px', lineHeight: '30px'}"
                   v-for="(paymentName, key) in paymentMethod" :value="key + 1">
            {{ paymentName }}
          </a-radio>
        </a-radio-group> -->
      </div>
    </div>
    <div class="fadeBottom"></div>
    <div id="bottom">
      <div class="count">
        <span class="text">價格: </span>
        <span class="payment">
          NT${{ $store.getters.getTotal }}
        </span>
      </div>
      <div class="button">
          <a-button type="primary" shape="round" :disabled="
          !name || !phone || !address || $store.getters.getAllFood.length === 0
          " @click="paymentEvent()">確認下單</a-button>
      </div>
    </div>
  </div>
</template>

<script>
import {LeftOutlined} from "@ant-design/icons-vue";
import {message} from "ant-design-vue";
import liff from '@line/liff'

export default {
  name: "index",
  data() {
    return {
      payment: null,
      paymentMethod: require("../../app/config.json").shop.payment,
      name: "",
      phone: "",
      address: "",
      customerid: "",
      operatorName: "",
      invoiceTitle: "",
      note: ""
    };
  },
  mounted() {
    this.name = localStorage.getItem("name") || "";
    this.phone = localStorage.getItem("phone") || "";
    this.address = localStorage.getItem("address") || "";
    if(sessionStorage.getItem('adminAuth')) {
      this.name = "到店消費";
      this.phone = "0900000000";
      this.address = "到店消費";
    }
  },
  methods: {
    paymentEvent() {
      // 校驗台灣電話
      // if (!/^09\d{8}$/.test(this.phone)) {
      //   message.error("請輸入正確的手機號碼");
      //   return;
      // }
      this.$router.push({
        name: 'Shipping',
        query: {
          name: this.name,
          phone: this.phone,
          address: this.address,
          customerid: this.customerid,
          operatorName: this.operatorName,
          invoiceTitle: this.invoiceTitle,
          note: this.note,
        }
      });
    }
  },
  components: {LeftOutlined}
}
</script>

<style lang="less">
#payment {
  .main {
    padding: 5px 10px;

    .route {
      font-size: 20px;
      font-weight: bold;
      padding: 8px;
      border-bottom: 1px solid #ccc;
      display: block;
    }

    .amount {
      font-size: 50px;
      font-weight: bold;
      padding: 8px;
      text-align: center;
      display: block;
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

    .payment-box {
      margin-bottom: 20px;

      .payment {
        margin: 10px 15%;
      }
    }
  }

  #bottom {
    position: fixed;
    display: flex;
    align-items: center;
    bottom: 0;
    width: 100%;
    background-color: var(--theme-color);
    color: var(--theme-color-text);
    padding: 20px;
    z-index: 10;

    .count {
      height: 100%;

      > span {
        display: block;
      }

      .text {
        font-size: 14px;
      }

      .payment {
        font-size: 20px;
        font-weight: bold;
        margin: 0 15%;
      }
    }

    .button {
      margin-left: auto;
    }
  }
}

.fadeBottom {
  height: 100px;
}
</style>