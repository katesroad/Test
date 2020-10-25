<template>
  <div>
    <p class="card-tip">
      <small
        >We only list <strong>active fusion platform swaps</strong> here.</small
      >
    </p>
    <q-table
      :data="data"
      :columns="columns"
      row-key="id"
      :loading="loading"
      class="address__tokens"
      color="primary"
      :pagination.sync="pagination"
      :rows-per-page-options="rowsPerPageOptions"
      flat
      v-if="rowsPerPageOptions"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="hash">
            <fusion-hash :hash="props.row.id" prefix="swap" />
          </q-td>
          <q-td>
            <swap-detail :swap="props.row" />
          </q-td>
          <q-td key="create_at">
            <fsn365-datetime :timestamp="props.row.create_at" />
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<style lang="scss" scoped>
@import url("./style.scss");
</style>

<script>
import FusionHash from "@/components/fusion-hash";
import Fsn365Datetime from "@/components/fsn365-datetime";
import SwapDetail from "./swap-detail";
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
  watch: {
    hash() {
      this.getSwaps();
    }
  },
  components: {
    FusionHash,
    Fsn365Datetime,
    SwapDetail
  },
  created() {
    this.getSwaps();
  },
  methods: {
    async getSwaps() {
      this.loading = true;
      const rawData = await this.$axios
        .get(`/address/${this.hash}/swaps`)
        .catch(e => []);
      this.loading = false;
      const swaps = rawData.map(swap => {
        const { data, ...others } = swap;
        const {
          SwapID,
          fromAssetSymbol,
          toAssetSymbol,
          FromAssetID,
          ToAssetID,
          MinFromAmount,
          MinToAmount
        } = data;
        const fromPairs = [];
        const toPairs = [];
        if (Array.isArray(ToAssetID)) {
          ToAssetID.map((assetID, index) => {
            toPairs.push({
              token: assetID,
              symbol: toAssetSymbol[index]
            });
          });
        } else {
          toPairs.push({
            symbol: toAssetSymbol,
            token: ToAssetID
          });
        }
        if (Array.isArray(FromAssetID)) {
          FromAssetID.map((assetID, index) => {
            fromPairs.push({
              token: assetID,
              symbol: fromAssetSymbol[index]
            });
          });
        } else {
          fromPairs.push({
            symbol: fromAssetSymbol,
            token: FromAssetID
          });
        }
        return { ...others, fromPairs, toPairs, id: SwapID };
      });
      this.data = swaps;
    }
  }
};
</script>
