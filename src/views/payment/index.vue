<template>
  <div id="payment">
    <div class="main">
      <div class="route">
        <router-link
          :to="{
            name: 'Home',
            query: { userid: this.$store.state.user },
          }"
        >
          <left-outlined style="margin-right: 5px" />
        </router-link>
        購物車
      </div>
      <a-list
        class="itemList"
        :pagination="{
          position: 'bottom',
          pageSize: 5,
          showSizeChanger: false,
          showQuickJumper: true,
          total: $store.getters.getAllFood.length,
        }"
        :data-source="$store.getters.getAllFood"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta :title="item.name">
              <template #description>
                <span style="color: red; display: block"
                  >NT$ {{ $store.getters.calcPrice(item) }}</span
                >
                <span
                  style="color: gray; display: block"
                  v-for="custom in item.custom"
                  :key="custom.id"
                >
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
        <div class="route">個人資訊</div>
        <div class="payment">
          <a-input
            placeholder="姓名"
            v-model:value="name"
            style="margin-bottom: 10px"
          />
          <a-input
            placeholder="手機"
            v-model:value="phone"
            style="margin-bottom: 10px"
          />
          <a-radio-group
            v-model:value="deliveryMethod"
            button-style="solid"
            size="large"
            @change="() => { if (deliveryMethod === '送貨') address = '' }"
          >
            <a-radio-button value="送貨">送貨</a-radio-button>
            <a-radio-button value="自取">自取</a-radio-button>
          </a-radio-group>
          <a-input
            placeholder="地址"
            v-model:value="address"
            style="margin-bottom: 10px"
            :disabled="deliveryMethod === '自取'"
          />
          <span>送貨/自取時間（非必填）</span>
          <a-date-picker
            v-model:value="deliverDate"
          />
          <a-time-picker v-model:value="deliverTime" format="HH:mm" />
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
        <span class="payment"> NT${{ $store.getters.getTotal }} </span>
      </div>
      <div class="button">
        <a-button
          type="primary"
          shape="round"
          :disabled="
            !name ||
            !phone ||
            (!address && deliveryMethod === '送貨') ||
            $store.getters.getAllFood.length === 0
          "
          @click="paymentEvent()"
          >確認下單</a-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import { LeftOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import liff from "@line/liff";
import dayjs from "dayjs";

export default {
  name: "index",
  data() {
    return {
      payment: null,
      paymentMethod: require("../../app/config.json").shop.payment,
      name: "",
      phone: "",
      address: "",
      deliveryMethod: "送貨",
      deliverDate: dayjs(),
      deliverTime: dayjs(),
    };
  },
  mounted() {
    this.name = localStorage.getItem("name") || "";
    this.phone = localStorage.getItem("phone") || "";
    this.address = localStorage.getItem("address") || "";
    if (sessionStorage.getItem("adminAuth")) {
      this.name = "到店消費";
      this.phone = "0900000000";
      this.address = "到店消費";
    }
  },
  methods: {
    paymentEvent() {
      // 校驗台灣電話
      if (!/^09\d{8}$/.test(this.phone)) {
        message.error("請輸入正確的手機號碼");
        return;
      }
      if (this.deliveryMethod === "自取") {
        this.address = "到店自取";
      }
      if (!this.deliverDate || !this.deliverTime) {
        message.error("日期時間請保留默認");
        return;
      }
        let combinedDateTime = this.deliverDate
          .hour(this.deliverTime.hour())
          .minute(this.deliverTime.minute())
          .second(this.deliverTime.second());
      if (sessionStorage.getItem("adminAuth")) {
        this.$root.startLoading(() => {
          fetch("https://linebot.otakux.org/order-admin", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: sessionStorage.getItem("adminAuth"),
            },
            body: JSON.stringify({
              customer: {
                name: this.name,
                phone: this.phone,
                address: this.address,
                deliver_time: combinedDateTime
              },
              user: "clerkAdmin",
              items: this.$store.getters.getAllFood,
            }),
          }).then((res) => {
            // 400
            if (res.status === 400) {
              message.error("錯誤的請求，请返回LINE重新點餐");
              return;
            } else if (res.status === 500) {
              message.error("伺服器錯誤，請稍後再試");
              return;
            } else {
              localStorage.setItem("name", this.name);
              localStorage.setItem("phone", this.phone);
              localStorage.setItem("address", this.address);
              message.success("點餐成功！");
              this.$store.commit("cleanCart");
            }
          });
        });
        return;
      }
      this.$root.startLoading(() => {
        fetch("https://linebot.otakux.org/order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer: {
              name: this.name,
              phone: this.phone,
              address: this.address,
              deliver_time: combinedDateTime
            },
            user: this.$store.state.user,
            items: this.$store.getters.getAllFood,
          }),
        }).then((res) => {
          // 400
          if (res.status === 400) {
            message.error("錯誤的請求，请返回LINE重新點餐");
            return;
          } else if (res.status === 500) {
            message.error("伺服器錯誤，請稍後再試");
            return;
          } else {
            localStorage.setItem("name", this.name);
            localStorage.setItem("phone", this.phone);
            localStorage.setItem("address", this.address);
            message.success("點單成功！請等待商家確認。");
            this.$store.commit("cleanCart");
            liff.closeWindow();
          }
        });
      });
    },
  },
  components: { LeftOutlined },
};
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
        border-radius: 10px;
      }
    }

    .payment-box {
      margin-bottom: 20px;

      .payment {
        margin: 10px 15%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 5px;
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
