<template>
  <div class="admin-page">
    <a-button @click="$router.push('/')" style="margin-bottom: 20px">
      到店消費
    </a-button>
    <a-col>
      <a-row :span="12">
        <div class="section">
          <h2>菜單管理</h2>
          <div class="add-area">
            <!-- 需要全部參數 -->
            <div class="add-item">
              <a-input v-model:value="newItem.name" placeholder="名稱" />
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
            :dataSource="$store.state.menu"
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
    </a-col>
  </div>
</template>

<script>
import { message } from "ant-design-vue";
import { QuestionCircleOutlined, PlusOutlined } from "@ant-design/icons-vue";
import initSqlJs from 'sql.js'
import { uuid } from "jsfast";

export default {
  name: "AdminPage",
  components: {
    QuestionCircleOutlined,
    PlusOutlined,
  },
  methods: {
    edit(id) {
      this.editableData[id] = { ...this.menu.find((item) => item.id === id) };
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
      const index = this.menu.findIndex((item) => item.id === id);
      const item = this.menu[index];
      this.menu.splice(index, 1, { ...item, ...newData });
      // edit item in ./veg_order.db
      initSqlJs().then(SQL => {
        const db = this.$store.state.db;
        db.run(`UPDATE menu SET name = '${newData.name}', purchase_price = 0, selling_price = 0, stock = 999, unit = '${newData.unit}', category = '${newData.category}' WHERE id = ${id}`);
        const data = db.export();
        const buffer = new ArrayBuffer(data.length);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < data.length; i++) {
          view[i] = data[i];
        }
      });
      delete this.editableData[id];
    },
    cancel(id) {
      delete this.editableData[id];
    },
    delete_item(id) {
      initSqlJs().then(SQL => {
        const db = this.$store.state.db;
        db.run(`DELETE FROM menu WHERE id = ${id}`);
        const data = db.export();
        const buffer = new ArrayBuffer(data.length);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < data.length; i++) {
          view[i] = data[i];
        }
      });
      delete this.editableData[id];
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
    },
    onChange(pagination, filters, sorter, extra) {
      this.extra = extra;
    },
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
      columns: [
        {
          title: "名稱",
          dataIndex: "name",
          key: "name",
          scopedSlots: { customRender: "name" },
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
          width: "15%",
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
