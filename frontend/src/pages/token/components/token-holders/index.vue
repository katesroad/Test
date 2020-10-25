<style lang="scss" scoped>
@import url('./style.scss');
</style>

<template>
  <q-card class="token__holders">
    <q-table
      :data="data"
      :columns="columns"
      row-key="id"
      :pagination.sync="pagination"
      :loading="loading"
      @request="onRequest"
      :rows-per-page-options="rowsPerPageOptions"
      binary-state-sort
      class="token__holders"
      color="primary"
      flat
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="address">
            <fusion-hash
              prefix="address"
              :hash="props.row.address"
              :use-abbrev="false"
            />
          </q-td>
          <q-td key="qty" :props="props">
            <calc-qty :qty="props.row.qty" :tooltip="true" />
          </q-td>
          <q-td key="qty_in" :props="props">
            <calc-qty :qty="props.row.qty_in" :tooltip="true" /> 
          </q-td>
          <q-td key="qty_own" :props="props">
            <calc-qty :qty="props.row.qty_own"  :tooltip="true" />
          </q-td>
          <q-td key="percentage">
            <span>{{calcPercentage(props.row)}}</span>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-card>
</template>

<script>
import {debounce} from 'quasar';
import FusionHash from "@/components/fusion-hash";
import CalcQty from '@/components/calc-qty';
import { ERC20_TOKEN_COLUMNS, NATIVE_TOKEN_COLUMNS } from "./table-config";

export default {
  props: {
    tokenQty: Number,
    tokenSymbol: String,
    hash: String,
    holders: Number
  },
  data() {
    const rowsPerPageOptions = this.$store.state.ROW_OPTIONS_FOR_PAGE
      .ROW_OPTIONS_FOR_DETAIL_PAGE;
    const rowsPerPage = rowsPerPageOptions[0];
    const rowsNumber = this.holders || 0;
    
    return {
      data: [],
      loading: false,
      pagination: { rowsPerPage, rowsNumber },
      rowsPerPageOptions,
    };
  },
  computed: {
    isERC20Token() {
      return this.hash.length === 42;
    },
    columns () {
      if(this.isERC20Token) {
        return ERC20_TOKEN_COLUMNS
      } else {
        return NATIVE_TOKEN_COLUMNS;
      }
    }
  },
  watch: {
    hash() {
      this.onRequest({
        pagination: this.pagination
      });
    }
  },
  components: {
    FusionHash,
    CalcQty
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
      params.sort = "qty";
      this.loading = true;

      this.$axios
        .get(`/token/${this.hash}/holders`, { params })
        .then(resData => {
          const { holders, total } = resData;
          this.data = holders;
          this.loading = false;
          this.pagination.page = page;
          this.pagination.rowsPerPage = rowsPerPage;
          this.pagination.rowsNumber = total;
        });
    }, 150),
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
        anchor = this.data[size - 1].qty;
        return { cmd, anchor };
      }
      if (page <= this.pagination.page) {
        cmd = "prev";
        anchor = this.data[0].qty;
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
      this.onRequest({
        pagination: this.pagination
      });
    },
    calcPercentage(record) {
      if(!this.tokenQty || !record) return 0;
      const { qty, qty_in } = record;
      const base = this.isERC20Token ? qty : (+qty + +qty_in);
      return ((+base / this.tokenQty) * 100).toFixed(2) + "%";
    },
  }
};
</script>
