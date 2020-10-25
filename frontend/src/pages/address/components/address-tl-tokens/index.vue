<template>
  <div>
    <p class="card-tip">
      <small style="color:red">
        This module is under construction...
        <!-- Tokens which are held by an address for a period of time are timelock
        tokens. -->
      </small>
    </p>
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
      required: true
    }
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
      data: []
    };
  },
  computed: {
    balanceTipText(row) {
      const { qty, qty_in, qty_own } = row;
      return "";
    }
  },
  watch: {
    hash() {
      this.getBalance();
    }
  },
  components: {
    Fsn365Datetime
  },
  created() {
    // this.getTlBalance();
  },
  methods: {
    async getTlBalance() {
      this.loading = true;
      const balance = await this.$axios
        .get(`/address/${this.hash}/tltokens`)
        .then(balancesData => {
          const balances = [];
          balancesData.map(tokenTlBalance => {
            const { symbol, token, data } = tokenTlBalance;
            data.map(item => {
              balances.push({
                ...item,
                token,
                symbol
              });
            });
          });
          return balances;
        }).catch(e => ([]));
      this.loading = false;
      this.data = balance;
    },
    calcQty(qty) {
      return this.$utils.calcQty(qty);
    }
  }
};
</script>
