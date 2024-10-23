<template>
    <div class="shipping-gen">
        <div class="to-print" id="toPrint">
            <div class="container">
                <div class="header">
                    <span>過癮菜行</span><br>
                    <span>送 貨 單</span>
                </div>
                <div class="customer-details">
                    <table class="tg">
                        <tbody>
                            <tr>
                                <td class="tg-0lax">客戶代號：{{ customerid }}</td>
                                <td class="tg-0lax">銷貨單號：</td>
                                <td class="tg-0lax">訂購單號：</td>
                            </tr>
                            <tr>
                                <td class="tg-0lax">銷貨日期：{{ 
                                    new Date().toLocaleDateString('zh-TW', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit'
                                    })
                                    }}</td>
                                <td class="tg-0lax" colspan="2">客戶名稱：{{ name }}</td>
                            </tr>
                            <tr>
                                <td class="tg-0lax">客戶電話：{{ phone }}</td>
                                <td class="tg-0lax">客戶傳真：</td>
                                <td class="tg-0lax">客戶地址：{{ address }}</td>
                            </tr>
                            <tr>
                                <td class="tg-0lax">業務人名：{{ operatorName }}</td>
                                <td class="tg-0lax">統編：</td>
                                <td class="tg-0lax">發票抬頭：{{ invoiceTitle }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="order-details">
                    <table class="tg">
                        <thead>
                            <tr>
                                <th class="tg-0lax">商品代號</th>
                                <th class="tg-0lax">商品名稱</th>
                                <th class="tg-0lax">數量</th>
                                <th class="tg-0lax">單位</th>
                                <th class="tg-0lax">單價</th>
                                <th class="tg-0lax">小計</th>
                                <th class="tg-0lax">搭贈</th>
                                <th class="tg-0lax">到期日</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in items">
                                <td class="tg-0lax">{{ item.id }}</td>
                                <td class="tg-0lax">{{ item.name }}</td>
                                <td class="tg-0lax">{{ item.count }}</td>
                                <td class="tg-0lax">{{ item.unit }}</td>
                                <td class="tg-0lax">{{ item.selling_price.result }}</td>
                                <td class="tg-0lax">{{ (item.count * item.selling_price.result).toFixed(1) }}</td>
                                <td class="tg-0lax">0</td>
                                <td class="tg-0lax"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="footer">
                    <table class="tg">
                        <tbody>
                            <tr>
                                <td class="tg-0lax">備註：{{ note }}</td>
                                <td class="tg-0lax"></td>
                                <td class="tg-0lax"></td>
                                <td class="tg-0lax"></td>
                                <td class="tg-0lax">合計：{{ total }}</td>
                                <td class="tg-0lax"></td>
                            </tr>
                            <tr>
                                <td class="tg-0lax"></td>
                                <td class="tg-0lax"></td>
                                <td class="tg-0lax"></td>
                                <td class="tg-0lax"></td>
                                <td class="tg-0lax">稅額：{{ tax }}</td>
                                <td class="tg-0lax"></td>
                            </tr>
                            <tr>
                                <td class="tg-0lax">主管：</td>
                                <td class="tg-0lax">會計：</td>
                                <td class="tg-0lax">配送員：</td>
                                <td class="tg-0lax">客戶簽收：</td>
                                <td class="tg-0lax">總計：{{ total + tax }}</td>
                                <td class="tg-0lax"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="button-container">
            <a-button type="primary" @click="print">列印</a-button>
        </div>
    </div>
</template>

<script>
export default {
    name: "shipping-gen",
    created() {
        this.customerid = this.$route.query.customerid;
        this.name = this.$route.query.name;
        this.phone = this.$route.query.phone;
        this.address = this.$route.query.address;
        this.operatorName = this.$route.query.operatorName;
        this.invoiceTitle = this.$route.query.invoiceTitle;
        this.note = this.$route.query.note;
        this.items = this.$store.getters.getAllFood;
        // 所有物品quantity設為1
        this.items.forEach(item => {
            item.quantity = 1;
        });
        // items，如果兩個id相同，則合併
        let items = [];
        this.items.forEach(item => {
            let index = items.findIndex(i => i.id === item.id);
            if (index === -1) {
                items.push(item);
            } else {
                items[index].quantity += 1;
            }
        });
        this.items = items;
        // 計算總價
        this.total = this.items.reduce((acc, item) => {
            return acc + Number((item.count * item.selling_price.result).toFixed(1));
        }, 0);
        this.tax = 0;
    },
    methods: {
        print() {
            let printContents = document.getElementById("toPrint").innerHTML;
            let originalContents = document.body.innerHTML;
            document.body.innerHTML = printContents;
            print();
            document.body.innerHTML = originalContents;
            this.$router.push({ name: "Home" });
            this.$store.commit("cleanCart");
            window.location.reload();
        }
    }
}
</script>

<style lang="less" scoped>
.container {
    max-width: 900px;
    margin: auto;
    padding: 20px;
    height: 400px;
}

.header {
    text-align: center;
    margin-bottom: 20px;
    font-size: x-large;
}

.footer {
    width: 100%;
    border-top: 1px solid black;
}

.order-details,
.customer-details {
    margin-bottom: 20px;
}

.order-details table,
.customer-details table,
.footer table {
    width: 100%;
    border-collapse: collapse;
}

.order-details thead {
    border-top: 1px solid black;
    border-bottom: 1px solid black;
}

.order-details th,
.order-details td,
.customer-details th,
.customer-details td {
    padding: 1px;
    text-align: left;
}

.button-container {
    text-align: center;
    margin-top: 20px;
}

@media print {

    #header,
    #footer,
    #nav {
        display: none !important;
    }

    /* a4 */
    @page {
        size: A4;
        margin: 0;
    }
}
</style>