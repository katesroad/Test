<style lang="scss" scoped>
@import url('./style.scss');
.q-table {
  border-top: 1px solid #e4e4e4;
}
</style>

<template>
  <q-card>
    <q-table
      title="Transactions"
      :data="data"
      :columns="columns"
      row-key="id"
      :loading="loading"
      class="blocks__txs txs"
      color="primary"
      :pagination.sync="pagination"
      :rows-per-page-options="rowsPerPageOptions"
      flat
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="hash">
            <fusion-hash :hash="props.row.hash" prefix="tx" />
          </q-td>

          <q-td key="timestamp" :props="props">
            <time-ago
              tooltip="true"
              :datetime="props.row.age * 1000"
              refresh
              long
            />
          </q-td>
          <q-td key="sender">
            <fusion-hash :hash="props.row.sender" prefix="address" />
          </q-td>
          <q-td key="data">
            <transaction-info :tx="props.row" />
          </q-td>
          <q-td key="receiver">
            <fusion-hash :hash="props.row.receiver" prefix="address" />
          </q-td>
          <q-td key="block" :props="props">
            <router-link :to="{ path: `/block/${props.row.block}` }"
              >{{ props.row.block }}
            </router-link>
          </q-td>
          <q-td key="fee">
            {{ (+props.row.fee).toFixed(5) }}
            <q-tooltip> {{ props.row.fee }} FSN </q-tooltip>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-card>
</template>

<script>
import TimeAgo from "vue2-timeago";
import FusionHash from "@/components/fusion-hash";
import TransactionInfo from "@/components/transaction-info";
import { columns } from "./table-config";

export default {
  props: {
    block: [Number, String],
    title: String,
    txs: Number
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
  watch: {
    block() {
      this.loadTxs();
    }
  },
  components: {
    FusionHash,
    TransactionInfo,
    TimeAgo
  },
  created() {
    this.loadTxs();
  },
  methods: {
    loadTxs(props) {
      this.loading = true;
      const path = `/block/${this.block}/txs`;
      this.$axios.get(path).then(txs => {
        this.data = txs;
        this.pagination.rowsNumber = txs.length;
        this.loading = false;
      });
    }
  }
};
</script>
