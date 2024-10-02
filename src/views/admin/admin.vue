<template>
  <div class="admin-page">
    <a-col>
      <a-row :span="12">
        <div class="section">
          <h2>菜單管理</h2>
          <div class="add-area">
            <!-- 需要全部參數 -->
            <div class="add-item">
              <a-input v-model:value="newItem.name" placeholder="名稱" />
              <a-input
                v-model:value="newItem.purchase_price"
                placeholder="進價"
              />
              <a-input
                v-model:value="newItem.selling_price"
                placeholder="售價"
              />
              <a-input v-model:value="newItem.stock" placeholder="庫存" />
              <a-input v-model:value="newItem.unit" placeholder="單位" />
              <a-select
                style="width: 100%"
                v-model:value="newItem.category"
                placeholder="分類"
              >
                <a-select-option value="水菜">水菜</a-select-option>
                <a-select-option value="大菜">大菜</a-select-option>
                <a-select-option value="根莖類">根莖類</a-select-option>
                <a-select-option value="豆類菇類小包菜"
                  >豆類菇類小包菜</a-select-option
                >
              </a-select>
              <a-button type="primary" @click="addItem"
                ><PlusOutlined />增加</a-button
              >
            </div>
          </div>
          <!-- <a-button class="add-button" type="primary" @click="addItem"><PlusOutlined />增加</a-button> -->
          <a-table
            :dataSource="menu"
            :columns="columns"
            :row-class-name="
              (_record, index) => (index % 2 === 1 ? 'table-striped' : null)
            "
            class="ant-table-striped"
          >
            <template #bodyCell="{ column, text, record }">
              <template
                v-if="
                  [
                    'name',
                    'purchase_price',
                    'selling_price',
                    'stock',
                    'unit',
                    'category',
                  ].includes(column.dataIndex)
                "
              >
                <div>
                  <a-input
                    v-if="
                      editableData[record.id] && column.dataIndex !== 'category'
                    "
                    v-model:value="editableData[record.id][column.dataIndex]"
                    style="margin: -5px 0"
                  />
                  <!-- choose category -->
                  <a-select
                    v-else-if="
                      column.dataIndex === 'category' && editableData[record.id]
                    "
                    v-model:value="editableData[record.id]['category']"
                    style="width: 100%"
                  >
                    <a-select-option
                      v-for="category in [
                        '水菜',
                        '大菜',
                        '根莖類',
                        '豆類菇類小包菜',
                      ]"
                      :key="category"
                      :value="category"
                    >
                      {{ category }}
                    </a-select-option>
                  </a-select>
                  <template v-else>
                    {{ text }}
                  </template>
                </div>
              </template>
              <template v-else-if="column.dataIndex === 'operation'">
                <div class="editable-row-operations">
                  <span
                    class="editable-row-operations-button"
                    v-if="editableData[record.id]"
                  >
                    <a-typography-link @click="save(record.id)"
                      >保存</a-typography-link
                    >
                    <a-popconfirm
                      class="delete-button"
                      title="確認要刪除嗎？"
                      @confirm="delete_item(record.id)"
                    >
                      <template #icon
                        ><question-circle-outlined style="color: red"
                      /></template>
                      <a>刪除</a>
                    </a-popconfirm>
                    <a-popconfirm
                      title="確認要取消嗎？"
                      @confirm="cancel(record.id)"
                    >
                      <a>取消</a>
                    </a-popconfirm>
                  </span>
                  <span v-else>
                    <a @click="edit(record.id)">編輯</a>
                  </span>
                </div>
              </template>
            </template>
          </a-table>
        </div>
      </a-row>
      <a-row :span="12">
        <div class="section">
          <h2>訂單管理</h2>
          <a-table
            :dataSource="orders"
            :columns="orderColumns"
            :row-class-name="
              (_record, index) => (index % 2 === 1 ? 'table-striped' : null)
            "
            class="ant-table-striped"
          >
            <template #bodyCell="{ column, text, record }">
              <template v-if="column.dataIndex === 'status'">
                <a-tag :color="text.color">{{ text.text }}</a-tag>
              </template>
              <template v-else-if="column.dataIndex === 'order_id'">
                {{ text.split("-")[0] }}
              </template>
              <!-- operations -->
                <template v-else-if="column.dataIndex === 'operation'">
                    <a-button
                    v-if="record.status.text === '商家未確認'"
                    type="link"
                    @click="confirmOrder(record)"
                    >確認</a-button
                    >
                    <a-button
                    v-if="record.status.text === '商家未確認'"
                    type="link"
                    @click="rejectOrder(record)"
                    >拒絕</a-button
                    >
                    <a-button
                    v-if="record.status.text === '準備送貨'"
                    type="link"
                    @click="completeOrder(record)"
                    >送達</a-button
                    >
                </template>
              <template v-else>
                {{ text }}
              </template>
            </template>
            <template #expandedRowRender="{ record }">
              <p style="margin: 0">
                <!-- 重複物品顯示×2，×3 -->
                <span v-for="item in record.items">
                    {{ item.name }}×{{ item.count }}{{ item.unit }}
                    <span v-if="record.items.indexOf(item) !== record.items.length - 1"
                        >, </span
                    >
                </span>
              </p>
            </template>
          </a-table>
        </div>
      </a-row>
    </a-col>
  </div>
</template>

<script>
import { message } from "ant-design-vue";
import { QuestionCircleOutlined, PlusOutlined } from "@ant-design/icons-vue";

export default {
  name: "AdminPage",
  components: {
    QuestionCircleOutlined,
    PlusOutlined,
  },
  created() {
    if (!sessionStorage.getItem("adminToken")) {
      this.$router.push("/login");
      return;
    }
    // fetch menu
    fetch("https://linebot.sleepingbed.top/api/menu/", {
        headers: {
          Authorization: sessionStorage.getItem("adminToken"),
        },
      method: "GET",
      ContentType: "application/json",
    })
      .then((res) => res.json())
      .then((data) => {
        this.menu = data;
      });

    // fetch orders
    fetch("https://linebot.sleepingbed.top/api/orders/orders", {
        headers: {
          Authorization: sessionStorage.getItem("adminToken"),
        },
      method: "GET",
      ContentType: "application/json",
    })
      .then((res) => res.json())
      .then((data) => {
        // '0-本人未確認', '1-商家未確認', '2-準備送貨', '7-已遭拒絕','8-已取消', '9-已失效', '10-完成', '100-異常'
        data.forEach((item) => {
          item.status = {
            0: { text: "本人未確認", color: "red" },
            1: { text: "商家未確認", color: "" },
            2: { text: "準備送貨", color: "" },
            7: { text: "已遭拒絕", color: "red" },
            8: { text: "已取消", color: "grey" },
            9: { text: "已失效", color: "grey" },
            10: { text: "完成", color: "green" },
            100: { text: "異常", color: "red" },
          }[item.status];
        });
        data.forEach((item) => {
          item.items = item.items.split(",");
        //   item 2 json
          item.items = JSON.parse(item.items);
            // 合并重复项
            let items = [];
            item.items.forEach((item) => {
              let index = items.findIndex((i) => i.id === item.id);
              if (index === -1) {
                items.push({ ...item, count: 1 });
              } else {
                items[index].count++;
              }
            });
            item.items = items;
        });
        this.orders = data;
      });
  },
  methods: {
    edit(id) {
      this.editableData[id] = { ...this.menu.find((item) => item.id === id) };
    },
    save(id) {
      const newData = this.editableData[id];
      const index = this.menu.findIndex((item) => item.id === id);
      const item = this.menu[index];
      this.menu.splice(index, 1, { ...item, ...newData });
      fetch(`https://linebot.sleepingbed.top/api/menu/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: sessionStorage.getItem("adminToken"),
        },
        body: JSON.stringify(newData),
      }).then((res) => {
        if (res.status !== 200) {
          message.error("保存失敗");
          return;
        }
        message.success("保存成功");
        delete this.editableData[id];
      });
      delete this.editableData[id];
    },
    cancel(id) {
      delete this.editableData[id];
    },
    delete_item(id) {
      fetch(`https://linebot.sleepingbed.top/api/menu/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: sessionStorage.getItem("adminToken"),
        },
      }).then((res) => {
        if (res.status !== 200) {
          message.error("刪除失敗");
          return;
        }
        this.menu = this.menu.filter((item) => item.id !== id);
        message.success("刪除成功");
        delete this.editableData[id];
      });
      delete this.editableData[id];
    },
    addItem() {
      if (
        !this.newItem.name ||
        !this.newItem.purchase_price ||
        !this.newItem.selling_price ||
        !this.newItem.stock ||
        !this.newItem.unit
      ) {
        message.error("請填寫完整");
        return;
      }
      fetch("https://linebot.sleepingbed.top/api/menu/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: sessionStorage.getItem("adminToken"),
        },
        body: JSON.stringify({
          ...this.newItem,
        }),
      })
        .then((res) => {
          if (res.status !== 200) {
            message.error("新增失敗");
            return;
          } else {
            message.success("新增成功");
          }
          return res.json();
        })
        .then((data) => {
          this.menu.push(data);
          this.edit(data.id);
        });
    },
    confirmOrder(record) {
      fetch(`https://linebot.sleepingbed.top/api/orders/orders/${record.order_id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: sessionStorage.getItem("adminToken"),
        },
        body: JSON.stringify({
          status: 2,
        }),
      }).then((res) => {
        if (res.status !== 200) {
          message.error("確認失敗");
          return;
        }
        message.success("確認成功");
        record.status = { text: "準備送貨", color: "" };
      });
    },
    rejectOrder(record) {
      fetch(`https://linebot.sleepingbed.top/api/orders/orders/${record.order_id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: sessionStorage.getItem("adminToken"),
        },
        body: JSON.stringify({
          status: 7,
        }),
      }).then((res) => {
        if (res.status !== 200) {
          message.error("拒絕失敗");
          return;
        }
        message.success("拒絕成功");
        record.status = { text: "已遭拒絕", color: "red" };
      });
    },
    completeOrder(record) {
      fetch(`https://linebot.sleepingbed.top/api/orders/orders/${record.order_id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: sessionStorage.getItem("adminToken"),
        },
        body: JSON.stringify({
          status: 10,
        }),
      }).then((res) => {
        if (res.status !== 200) {
          message.error("送達失敗");
          return;
        }
        message.success("送達成功");
        record.status = { text: "完成", color: "green" };
      });
    },
  },
  data() {
    return {
      menu: [],
      orders: [],
      editableData: {},
      newItem: {
        name: "",
        purchase_price: null,
        selling_price: null,
        stock: null,
        unit: "",
        category: "水菜",
      },
      orderColumns: [
        {
          title: "短編號",
          dataIndex: "order_id",
          key: "order_id",
          scopedSlots: { customRender: "order_id" },
          width: "10%",
        },
        {
          title: "姓名",
          dataIndex: "name",
          key: "name",
          scopedSlots: { customRender: "name" },
          width: "10%",
        },
        {
          title: "送貨地址",
          dataIndex: "delivery_address",
          key: "delivery_address",
          scopedSlots: { customRender: "delivery_address" },
          width: "25%",
        },
        {
          title: "電話",
          dataIndex: "tel",
          key: "tel",
          scopedSlots: { customRender: "tel" },
          width: "15%",
        },
        {
          title: "下單日期",
          dataIndex: "order_date",
          key: "order_date",
          scopedSlots: { customRender: "order_date" },
          width: "20%",
        },
        {
          title: "總價/NT$",
          dataIndex: "total_price",
          key: "total_price",
          scopedSlots: { customRender: "total_price" },
          width: "10%",
        },
        {
          title: "狀態",
          dataIndex: "status",
          key: "status",
          scopedSlots: { customRender: "status" },
          width: "10%",
        },
        {
          title: "操作",
          dataIndex: "operation",
          key: "action",
          scopedSlots: { customRender: "action" },
          width: "10%",
        },
      ],
      columns: [
        {
          title: "名稱",
          dataIndex: "name",
          key: "name",
          scopedSlots: { customRender: "name" },
          width: "10%",
        },
        {
          title: "進價",
          dataIndex: "purchase_price",
          key: "purchase_price",
          scopedSlots: { customRender: "purchase_price" },
          width: "10%",
        },
        {
          title: "售價",
          dataIndex: "selling_price",
          key: "selling_price",
          scopedSlots: { customRender: "selling_price" },
          width: "10%",
        },
        {
          title: "庫存",
          dataIndex: "stock",
          key: "stock",
          scopedSlots: { customRender: "stock" },
          width: "10%",
        },
        {
          title: "單位",
          dataIndex: "unit",
          key: "unit",
          scopedSlots: { customRender: "unit" },
          width: "10%",
        },
        {
          title: "分類",
          dataIndex: "category",
          key: "category",
          scopedSlots: { customRender: "category" },
          width: "20%",
        },
        {
          title: "操作",
          dataIndex: "operation",
          key: "action",
          scopedSlots: { customRender: "action" },
          width: "15%",
        },
      ],
    };
  },
};
</script>

<style lang="less" scoped>
.admin-page {
  padding: 20px;
}

.section {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
}

h2 {
  margin-bottom: 20px;
}

.editable-row-operations-button {
  display: flex;
  gap: 10px;
}

.delete-button {
  color: red;
}

.delete-button:hover {
  color: rgba(255, 0, 0, 0.938);
}

.add-area {
  margin-bottom: 10px;
  margin-right: 10px;
  float: right;
}

.add-item {
  display: flex;
  gap: 10px;
}
</style>
