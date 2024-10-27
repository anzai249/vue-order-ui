<template>
  <div class="admin-page">
    <a-button @click="warningModal=true" style="margin-bottom: 20px" danger >
      初始化資料庫
    </a-button>
    <a-col>
      <a-row :span="12">
        <div class="section">
          <h2>歷史訂單</h2>
          <!-- <a-button class="add-button" type="primary" @click="addItem"><PlusOutlined />增加</a-button> -->
          <a-table
            :dataSource="orders"
            :columns="columns"
            :row-class-name="
              (_record, index) => (index % 2 === 1 ? 'table-striped' : null)
            "
            class="ant-table-striped"
          >
          <template #expandedRowRender="{ record }">
            <span v-for="item in record.food">
              {{ item.name }} x {{ item.count }}<br>
            </span>
          </template>
          </a-table>
        </div>
      </a-row>
    </a-col>
    <a-modal v-model:visible="warningModal" title="初始化資料庫" ok-text="確認初始化" cancel-text="取消" @ok="removeDB()">
      <p>初始化資料庫是一個危險操作，請一定要在資料庫損壞或不可逆操作時進行。</p>
    </a-modal>
  </div>
</template>

<script>
import { message } from "ant-design-vue";
import { QuestionCircleOutlined, PlusOutlined } from "@ant-design/icons-vue";
import { uuid } from "jsfast";

export default {
  name: "AdminPage",
  components: {
    QuestionCircleOutlined,
    PlusOutlined,
  },
  methods: {
    edit(id) {
      this.editableData[id] = { ...this.$store.state.menu.find((item) => item.id === id) };
    },
    save(id) {
      if (
        !this.editableData[id].name ||
        !this.editableData[id].stock ||
        !this.editableData[id].unit
      ) {
        message.error("請填寫完整");
        return;
      }
      const newData = this.editableData[id];
      const index = this.$store.state.menu.findIndex((item) => item.id === id);
      const item = this.$store.state.menu[index];
      this.$store.state.menu.splice(index, 1, { ...item, ...newData });
      this.$store.commit("updateMenuItem", newData);
      message.success("保存成功");
      delete this.editableData[id];
    },
    cancel(id) {
      delete this.editableData[id];
    },
    delete_item(id) {
      this.$store.commit("deleteMenuItem", id);
      message.success("刪除成功");
    },
    addItem() {
      if (
        !this.newItem.name ||
        !this.newItem.unit
      ) {
        message.error("請填寫完整");
        return;
      }
      // generate a new uuid
      this.id = uuid();
      this.newItem.id = this.id;
      // this.$store.state.db.run(`INSERT INTO menu (id, name, purchase_price, selling_price, stock, unit, category) VALUES ('${this.id}', '${this.newItem.name}', 0, 0, 999, '${this.newItem.unit}', '${this.newItem.category}')`);
      this.$store.commit("addMenuItem", this.newItem)
      message.success("保存成功");
    },
    onChange(pagination, filters, sorter, extra) {
      this.extra = extra;
    },
    removeDB() {
      this.$store.commit("removeDB");
      this.warningModal = false;
      window.location.reload();
    },
  },
  created() {
    // localStorage歷史訂單
    this.orders = JSON.parse(localStorage.getItem("history")) || [];
  },
  data() {
    return {
      menu: [],
      orders: [],
      editableData: {},
      filteredPhoneValue: "",
      extra: {filters:{}},
      id: "",
      newItem: {
        name: "",
        purchase_price: null,
        selling_price: null,
        stock: null,
        unit: "",
        category: "水菜",
      },
      warningModal: false,
      columns: [
        {
          title: "ID",
          dataIndex: "id",
          key: "id",
          width: "10%",
        },
        {
          title: "客戶名稱",
          dataIndex: "name",
          key: "name",
          width: "15%",
          scopedSlots: { customRender: "name" },
        },
        {
          title: "電話",
          dataIndex: "phone",
          key: "phone",
          width: "10%",
        },
        {
          title: "地址",
          dataIndex: "address",
          key: "address",
          width: "15%",
        },
        {
          title: "客戶ID",
          dataIndex: "customerid",
          key: "customerid",
          width: "10%",
        },
        {
          title: "操作員",
          dataIndex: "operatorName",
          key: "operatorName",
          width: "5%",
        },
        {
          title: "發票抬頭",
          dataIndex: "invoiceTitle",
          key: "invoiceTitle",
          width: "10%",
        },
        {
          title: "備註",
          dataIndex: "note",
          key: "note",
          width: "10%",
        },
        {
          title: "總價",
          dataIndex: "total",
          key: "total",
          width: "10%",
        }
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
