<template>
  <q-card>
    <q-table
      title="Top Accounts"
      :data="data"
      :columns="columns"
      row-key="id"
      :pagination.sync="pagination"
      :loading="loading"
      @request="onRequest"
      :rows-per-page-options="rowsPerPageOptions"
      binary-state-sort
      class="tokens"
      color="primary"
      flat
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="address">
            <fusion-hash
              :hash="props.row.address"
              prefix="address"
              v-if="props.row.address"
            />
          </q-td>
          <q-td key="qty" :props="props"> {{ props.row.qty }} FSN </q-td>
          <q-td key="qty_in" :props="props">
            {{ props.row.qty_in }}
          </q-td>
          <q-td key="qty_in" :props="props">
            {{ props.row.txs }}
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-card>
</template>

<script>
import FusionHash from "@/components/fusion-hash";
import { columns, rowsPerPageOptions } from "./table-config";

export default {
  name: "top-accounts",
  data() {
    let rowsPerPage = rowsPerPageOptions[0];
    return {
      loading: false,
      pagination: {
        page: 1,
        rowsPerPage,
        rowsNumber: 100
      },
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
      if (this.type === 0) return "Fusion Tokens";
      else return "Erc20 Tokens";
    }
  },
  watch: {
    "$route.query.type"() {
      this.onRequest({
        pagination: this.pagination
      });
    }
  },
  components: {
    FusionHash
  },
  created() {
    this.onRequest({
      pagination: this.pagination
    });
  },
  methods: {
    async onRequest(props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination;
      const params = this.getQueryCmdAndAnchor(page);
      params.size = rowsPerPage;
      this.loading = true;
      const path = `/address`;
      await this.$axios
        .get(path, { params })
        .then(address => {
          this.data = address;
          this.pagination.page = page;
          this.pagination.rowsPerPage = rowsPerPage;
        })
        .catch(e => console.log);
      this.loading = false;
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
