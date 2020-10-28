<style lang="scss" scoped>
.bk {
  &-reward {
    background: #d2daf3;
    padding: 4px 6px;
    border-radius: 4px;
    color: #353535;
    display: none;
    @media screen and (min-width: 520px) {
      display: inline;
    }
  }
  &-number {
    font-size: 110%;
    text-align: left;
  }
  &-timestamp {
    text-align: left;
    .has-tooltip {
      font-size: 12px !important;
      color: #82828282 !important;
    }
  }
}
</style>

<template>
  <div>
    <q-card class="latest-blocks">
      <q-card-section class="justify-between flex align-center">
        <span class="text-subtitle2">Latest Blocks</span>
        <router-link to="/blocks">View All</router-link>
      </q-card-section>
      <q-table
        :data="blocks"
        :columns="columns"
        row-key="id"
        binary-state-sort
        class="no-bottom"
        color="primary"
        :pagination.sync="pagination"
        flat
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="height">
              <div class="row justity-start items-center">
                <img src="svg/block.svg" class="item-icon" />
                <span class="column">
                  <router-link
                    :to="`/block/${props.row.height}`"
                    class="bk-number"
                  >
                    {{ props.row.height }}</router-link
                  >
                  <time-ago
                    tooltip="true"
                    :datetime="props.row.timestamp * 1000"
                    refresh
                    class="bk-timestamp"
                  />
                </span>
              </div>
            </q-td>
            <q-td>
              <div class="column">
                <div class="row justity-start">
                  <span class="field-key">Miner </span>
                  <fusion-hash
                    :hash="props.row.miner"
                    prefix="address"
                    :size="5"
                  />
                </div>
                <div class="row justify-start">
                   <span style="margin-right:4px">{{ props.row.txs }}  txs</span>
                  <span class="field-key">In block</span>
                </div>
              </div>
            </q-td>
            <q-td key="reward">
              <span class="bk-reward">
                {{ props.row.reward.toFixed(2) }} FSN
              </span>
              <q-tooltip> {{ props.row.reward }} FSN </q-tooltip>
            </q-td>
          </q-tr>
        </template>
        <template v-slot:bottom></template>
      </q-table>
    </q-card>
  </div>
</template>

<script>
import FusionHash from "@/components/fusion-hash";
import TimeAgo from "vue2-timeago";
import { columns } from "./table-config";

export default {
  name: "latest-blocks",
  props: {
    blocks: Array
  },
  data() {
    return {
      columns,
      pagination: {
        rowsPerPage: 6
      }
    };
  },
  components: {
    FusionHash,
    TimeAgo
  }
};
</script>
