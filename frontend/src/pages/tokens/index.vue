<template>
  <q-card>
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
      color="primary"
      flat
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="name">
            <router-link :to="`/token/${props.row.hash}`">
            {{ props.row.symbol }}
            </router-link>
            <q-tooltip>{{ props.row.name }} </q-tooltip>
          </q-td>
          <q-td key="qty" :props="props">
            <calc-qty :qty="props.row.qty" :tooltip="true" />
          </q-td>
          <q-td key="holders" :props="props">
            <calc-qty :qty="props.row.holders" :tooltip="true" />
          </q-td>
           <q-td key="txs" :props="props">
            <calc-qty :qty="props.row.txs" :tooltip="true" />
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-card>
</template>

<script>
import { debounce } from "quasar";
import { columns } from "./table-config";
import CalcQty from '@/components/calc-qty';

export default {
  data() {
    const rowsPerPageOptions = this.$store.state.ROW_OPTIONS_FOR_PAGE
      .ROW_OPTIONS_FOR_LIST_PAGE;
    const rowsPerPage = rowsPerPageOptions[0];
    return {
      loading: false,
      pagination: { rowsPerPage, rowsNumber: 0 },
      rowsPerPageOptions,
      columns,
      data: []
    };
  },
  computed: {
    type() {
      if (+this.$route.query.type === 0) return 0;
      else return 1;
    },
    title() {
      if (this.type === 0) return "Native Tokens";
      else return "FRC20 Tokens";
    }
  },
  watch: {
    "$route.query.type"() {
      this.onRequest({
        pagination: this.pagination
      });
    }
  },
  components:{
    CalcQty
  },
  mounted() {
    this.onRequest({
      pagination: this.pagination
    });
  },
  methods: {
    onRequest: debounce(function (props) {
      if (this.loading) return;
      const { page, rowsPerPage, sortBy, descending } = props.pagination;
      const params = this.getQueryCmdAndAnchor(page);
      params.size = rowsPerPage;
      params.type = this.type;
      this.loading = true;

      this.$axios.get("/tokens", { params }).then(resData => {
        const { tokens, total } = resData;
        this.data = tokens;
        this.loading = false;
        this.pagination.page = page;
        this.pagination.rowsPerPage = rowsPerPage;
        this.pagination.rowsNumber = total;
      }, 150);
    }),
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
        anchor = this.data[size - 1].txs;
        return { cmd, anchor };
      }
      if (page <= this.pagination.page) {
        cmd = "prev";
        anchor = this.data[0].txs;
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
      this.rowsNumber = 0;
      this.onRequest({
        pagination: this.pagination
      });
    }
  }
};
</script>
