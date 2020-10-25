<template>
  <div class="anyswap-trade">
    <q-table
      :data="data"
      :columns="columns"
      row-key="id"
      :pagination.sync="pagination"
      :loading="loading"
      @request="onRequest"
      :rows-per-page-options="rowsPerPageOptions"
      binary-state-sort
      class="anyswap__txs"
      color="primary"
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
              :datetime="props.row.timestamp * 1000"
              refresh
              long
            />
          </q-td>
          <q-td key="sender">
            <trade-type :type="props.row.type" />
          </q-td>
          <q-td key="block">
            <transfer-info :transfer="props.row.data.from" />
          </q-td>
          <q-td key="data">
            <transfer-info :transfer="props.row.data.to" />
          </q-td>
          <q-td key="receiver">
            <trade-price :data="props.row.data" />
          </q-td>
          <q-td key="fee"> {{ props.row.fee }} FSN </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script>
import { debounce } from "quasar";
import TimeAgo from "vue2-timeago";
import FusionHash from "@/components/fusion-hash";
import TransferInfo from "@/components/transaction-info/transfer-info";
import TradeType from "../trade-type";
import TradePrice from '../trade-price';
import { columns } from "./table-config";

export default {
  name: "anyswap-trade",
  data() {
    const {
      ROW_OPTIONS_FOR_LIST_PAGE
    } = this.$store.state.ROW_OPTIONS_FOR_PAGE;
    const rowsPerPageOptions = ROW_OPTIONS_FOR_LIST_PAGE;
    const rowsPerPage = rowsPerPageOptions[0];
    const rowsNumber = this.$store.state.txCount.anyswap || 0;
    return {
      loading: false,
      columns,
      data: [],
      pagination: { rowsNumber, page: 1, rowsPerPage },
      rowsPerPageOptions
    };
  },
  components: {
    TimeAgo,
    FusionHash,
    TransferInfo,
    TradeType,
    TradePrice
  },
  created() {
    this.onRequest({
      pagination: this.pagination
    });
  },
  methods: {
    onRequest: debounce(function(props) {
      if (this.loading) return;
      const { page, rowsPerPage, sortBy, descending } = props.pagination;
      const params = this.getQueryCmdAndAnchor(page);
      params.size = rowsPerPage;
      this.loading = true;

      let path = "/anyswap/txs";
      if (this.token) path = `/token/${this.token}/txs`;
      if (this.address) path = `/address/${this.address}/txs`;

      this.$axios.get(path, { params }).then(resData => {
        const { txs, total, anchor } = resData;
        if (anchor) {
          this.statsAnchor = {
            first: +anchor.first,
            last: +anchor.last
          };
        }
        this.data = txs;
        this.loading = false;
        this.pagination.page = page;
        this.pagination.rowsPerPage = rowsPerPage;
        this.pagination.rowsNumber = total;
      });
    }, 150),
    getQueryCmdAndAnchor(page) {
      let cmd, anchor;
      const statsAnchor = this.statsAnchor;
      const size = this.data.length;

      const { rowsPerPage, rowsNumber } = this.pagination;
      const boundary = rowsPerPage * page;

      if (page == 1) {
        return { cmd: "first" };
      }
      if (page > this.pagination.page && boundary < rowsNumber) {
        cmd = "next";
        anchor = this.data[size - 1].id;
        return { cmd, anchor };
      }
      if (page <= this.pagination.page) {
        cmd = "prev";
        anchor = this.data[0].id;
        return { cmd, anchor };
      }
      return { cmd: "last" };
    }
  }
};
</script>
