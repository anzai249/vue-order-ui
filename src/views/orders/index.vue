<template>
  <div id="orderList">
    <span class="title">
      <router-link to="/">
        <left-outlined style="margin-right: 5px" />
      </router-link>
      訂單
      <span style="float: right; font-size: medium;">
        注意：本人未確認訂單將在次日 0 時自動取消
      </span>
    </span>
    <a-card style="width: 100%" v-for="item in orders">
      <!-- <template #actions>
        <CheckOutlined @click="confirmOrder(item.order_id)" v-if="item.status.text === '本人未確認'" key="check" />
        <CloseOutlined @click="cancelOrder(item.order_id)" v-if="item.status.text === '本人未確認'" key="cancel" />
        <span v-if="item.status.text !== '本人未確認'">
            只有在本人未確認時才可以操作訂單
        </span>
      </template> -->
      <a-card-meta :title="`訂單-`+item.order_id.split('-')[0]"> </a-card-meta>
      <span style="color: grey; font-size: xx-small">編號：{{ item.order_id }}</span>
      <div class="orderItems">
        <div v-for="veg in item.items" class="orderItem">
            <span>{{ veg.name }} （{{ veg.category }}）</span>
            <span style="color:tomato;">NT${{ veg.selling_price }}</span>
        </div>
      </div>
      <div class="orderMeta">
        <span
          >訂單狀態：<span :style="`color:` + item.status.color">{{
            item.status.text
          }}</span></span
        >
        <span>下單時間：{{ item.order_date }}</span>
        <span style="color: red; font-size: x-large; text-align: end; padding: 0 10px">NT${{ item.total_price }}</span>
      </div>
    </a-card>
  </div>
</template>

<script>
import { LeftOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons-vue";

export default {
  name: "orderList",
  data() {
    return {
      orders: [],
      orderStatus: {
        // '0-本人未確認', '1-商家未確認', '2-準備送貨', '8-已取消', '9-已失效', '10-完成', '100-異常'
        0: { text: "本人未確認", color: "red" },
        1: { text: "商家未確認", color: "" },
        2: { text: "準備送貨", color: "" },
        7: { text: "已遭拒絕", color: "red" },
        8: { text: "已取消", color: "grey" },
        9: { text: "已失效", color: "grey" },
        10: { text: "完成", color: "green" },
        100: { text: "異常", color: "red" },
      },
    };
  },
  methods: {
  },
  components: {
    LeftOutlined,
    CheckOutlined,
    CloseOutlined
  },
  created() {
    fetch("https://linebot.otakux.org/api/orders/users/"+this.$store.state.user+"/orders", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        // 重寫訂單狀態
        res.forEach((item) => {
          item.status = this.orderStatus[item.status];
        });
        res.forEach((item) => {
          item.items = item.items.split(",");
        //   item 2 json
          item.items = JSON.parse(item.items);

        });
        this.orders = res;
      });
  },
};
</script>

<style lang="less" scoped>
#orderList {
  padding: 20px;
  .title {
    font-size: 20px;
    margin-bottom: 20px;
  }
  .orderMeta {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    margin-top: 20px;
  }
  .orderItems {
    display: flex;
    flex-direction: column;
    color: grey;
    padding: 10px;
    border-top: 1px solid #f0f0f0;
    border-bottom: 1px solid #f0f0f0;
    margin-top: 10px;
  }
  .orderItem {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
  }
}
</style>
