<template>
  <q-table
    title="Blocks"
    :data="data"
    :columns="columns"
    row-key="id"
    :pagination.sync="pagination"
    :loading="loading"
    @request="onRequest"
    :rows-per-page-options="rowsPerPageOptions"
    binary-state-sort
    class="blocks"
    color="primary"
  >
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td key="height" :props="props">
          <span
            class="row justify-center items-center"
            style="min-width: 100px"
          >
            <img src="svg/block.svg" style="margin-right: 16px; width: 32px" />
            <router-link :to="{ path: `/block/${props.row.height}` }">
              {{ props.row.height }}
            </router-link>
          </span>
        </q-td>
        <q-td>
          <time-ago
            :datetime="props.row.timestamp * 1000"
            refresh
            :tooltip="true"
            long
          />
        </q-td>
        <q-td>
          <router-link :to="{ path: `/block/${props.row.height}` }">
            {{ props.row.txs }}
          </router-link>
        </q-td>
        <q-td>
          <fusion-hash :hash="props.row.miner" prefix="address" />
        </q-td>
        <q-td
          >{{ props.row.reward.toFixed(2) }} FSN
          <q-tooltip>{{ props.row.reward }} FSN</q-tooltip>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script>
import { columns } from "./table-config";
import TimeAgo from "vue2-timeago";
import FusionHash from "@/components/fusion-hash";

export default {
  data() {
    const rowsPerPageOptions = this.$store.state.ROW_OPTIONS_FOR_PAGE
      .ROW_OPTIONS_FOR_LIST_PAGE;
    const rowsPerPage = rowsPerPageOptions[0];
    return {
      loading: false,
      pagination: {
        page: 1,
        rowsPerPage,
        rowsNumber: this.networkHeight
      },
      rowsPerPageOptions,
      columns,
      data: []
    };
  },
  computed: {
    networkHeight() {
      return this.$store.state.network.height;
    },
    addressLabels() {
      return this.$store.state.addressLabels;
    }
  },
  watch: {
    networkHeight() {
      this.pagination.rowsNumber = this.networkHeight;
      this.onRequest({
        pagination: this.pagination
      });
    }
  },
  components: {
    TimeAgo,
    FusionHash
  },
  created() {
    this.onRequest({
      pagination: this.pagination
    });
  },
  methods: {
    onRequest(props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination;
      const params = this.getQueryCmdAndAnchor(page);
      params.size = rowsPerPage;
      this.loading = true;
      this.$axios.get("/blocks", { params }).then(blocks => {
        this.data = blocks;
        this.loading = false;
        this.pagination.page = page;
        this.pagination.rowsPerPage = rowsPerPage;
        this.pagination.rowsNumber = this.networkHeight;
      });
    },
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
        anchor = this.data[size - 1].height;
        return { cmd, anchor };
      }
      if (page <= this.pagination.page) {
        cmd = "prev";
        anchor = this.data[0].height;
        return { cmd, anchor };
      }
      return { cmd: "last" };
    }
  }
};
</script>
