<style lang="scss" scoped>
@import url('./style.scss');
</style>

<template>
  <q-table
    :title="title"
    :data="data"
    :columns="columns"
    row-key="id"
    :pagination.sync="pagination"
    :loading="loading"
    @request="onRequest"
    :rows-per-page-options="rowsPerPageOptions"
    binary-state-sort
    :class="classes"
    color="primary"
    flat
    v-if="block === undefined"
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
          <transaction-info
            :tx="props.row"
            style="max-width: 140px; margin: 0 auto"
          />
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
          {{ (+props.row.fee).toFixed(5) }} FSN
          <q-tooltip> {{ props.row.fee }} FSN </q-tooltip>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script>
import { debounce } from "quasar";
import TimeAgo from "vue2-timeago";
import FusionHash from "@/components/fusion-hash";
import TransactionInfo from "@/components/transaction-info";
import { columns } from "./table-config";

export default {
  props: {
    address: String,
    token: String,
    title: String,
    txs: Number,
    block: Number,
  },
  data() {
    // pagination size options
    const {
      ROW_OPTIONS_FOR_DETAIL_PAGE,
      ROW_OPTIONS_FOR_LIST_PAGE
    } = this.$store.state.ROW_OPTIONS_FOR_PAGE;
    let rowsPerPageOptions;
    if (this.address || this.token) {
      rowsPerPageOptions = ROW_OPTIONS_FOR_DETAIL_PAGE;
    } else {
      rowsPerPageOptions = ROW_OPTIONS_FOR_LIST_PAGE;
    }

    // total txs count
    const rowsPerPage = rowsPerPageOptions[0];
    const rowsNumber = this.txs || 0;

    // txs anchor for token/address or overall txs
    
    return {
      loading: false,
      pagination: { rowsPerPage, rowsNumber, page: 1 },
      rowsPerPageOptions,
      columns,
      data: [],
    };
  },
  computed: {
    txCount() {
      return this.$store.state.txCount;
    },
    classes() {
      let classes = 'txs';
      if (this.token) return `${classes} token__txs`
      if (this.address) return `${classes} address_txs`;
      return classes;
    }
  },
  watch: {
    txCount() {
      if (!this.address && !this.token) {
        this.pagination.rowsNumber = this.txCount.txs;
      }
    },
    txs() {
      this.pagination.rowsNumber = this.txs || 0;
    },
    address() {
      this.resetPaginationParams();
      this.onRequest({
        pagination: this.pagination
      });
    },
    token() {
      this.resetPaginationParams();
      if (this.acnhor) {
        this.statsAnchor = {
          first: +this.anchor.first,
          last: +this.acnhor.last
        };
      }
      this.onRequest({
        pagination: this.pagination
      });
    },
  
  },
  components: {
    FusionHash,
    TransactionInfo,
    TimeAgo
  },
  mounted() {
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

      let path = "/txs";
      if (this.token) path = `/token/${this.token}/txs`;
      if (this.address) path = `/address/${this.address}/txs`;

      this.$axios.get(path, { params }).then(resData => {
        const { txs, total } = resData;
       
        this.data = txs;
        this.loading = false;
        this.pagination.page = page;
        this.pagination.rowsPerPage = rowsPerPage;
        this.pagination.rowsNumber = total;
      });
    }, 150),
    getAddress(hash) {
      const label = this.addressLabels[hash];
      if (label) return label;
      else return hash;
    },
    getQueryCmdAndAnchor(page) {
      let cmd, anchor;
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
    },
    resetPaginationParams() {
      this.pagination.page = 1;
      if (this.address || this.token) {
        this.pagination.rowsPerPage = 15;
      } else {
        this.pagination.rowsPerPage = rowsPerPageOptions[0];
      }
      this.rowsNumber = 30000;
      this.onRequest({
        pagination: this.pagination
      });
    }
  }
};
</script>
