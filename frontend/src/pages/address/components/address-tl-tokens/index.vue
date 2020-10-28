<template>
  <div>
    <q-table
      :data="data"
      :columns="columns"
      row-key="id"
      :loading="loading"
      class="address__tl-tokens"
      color="primary"
      :pagination.sync="pagination"
      :rows-per-page-options="rowsPerPageOptions"
      flat
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="token">
            {{ calcQty(props.row.value) }}
            <router-link :to="`/token/${props.row.token}`">
              <b>
                {{ props.row.symbol }}
              </b>
            </router-link>
            <q-tooltip>{{ props.row.value }}</q-tooltip>
          </q-td>
          <q-td key="startTime" :props="props">
            <fsn365-datetime :timestamp="props.row.startTime" />
            ~
            <fsn365-datetime :timestamp="props.row.endTime" />
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>
>

<script>
import Fsn365Datetime from "@/components/fsn365-datetime";
import { columns } from "./table-config";

export default {
  name: "address-balance",
  props: {
    hash: {
      type: String,
      required: true,
    },
  },
  data() {
    const rowsPerPageOptions = this.$store.state.ROW_OPTIONS_FOR_PAGE
      .ROW_OPTIONS_FOR_DETAIL_PAGE;
    const rowsPerPage = rowsPerPageOptions[0];
    return {
      loading: false,
      pagination: { rowsPerPage },
      rowsPerPageOptions,
      columns,
      data: [],
    };
  },
  computed: {
    balanceTipText(row) {
      const { qty, qty_in, qty_own } = row;
      return "";
    },
  },
  watch: {
    hash() {
      this.getBalance();
    },
  },
  components: {
    Fsn365Datetime,
  },
  created() {
    this.getTlBalances();
  },
  methods: {
    async getTlBalances() {
      this.loading = true;
      const balances = await this.rpcGetAddressTlBalance(this.hash).then(
        async (data) => {
          const tokens = Object.keys(data);
          const snapshotMap = await this.getTokensSnapshots(tokens);
          const tlList = [];
          Object.keys(data).map((key) => {
            const items = data[key].Items || [];
            const { symbol, precision } = snapshotMap[key];
            if (symbol) {
              items.map((item) => {
                const { StartTime, EndTime, Value } = item;
                const now = Date.now() / 1000;
                if (EndTime > now) {
                  tlList.push({
                    token: key,
                    startTime: StartTime,
                    endTime: EndTime,
                    value: Value / Math.pow(10, precision),
                    symbol,
                  });
                }
              });
            }
          });
          return tlList;
        }
      ).catch(e => {
        this.$q.notify({
          message: 'Error happened when loading address timelock balance.',
          position: "top",
          color: "warning"
        });
      })
      this.loading = false;
      this.data = balances;
    },
    getTokensSnapshots(tokens) {
      return this.$axios.post("/token/snapshots", tokens).then((data) => {
        console.log(data);
        return data;
      });
    },
    calcQty(qty) {
      return this.$utils.calcQty(qty);
    },
  },
};
</script>
