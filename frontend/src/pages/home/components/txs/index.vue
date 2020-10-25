<template>
  <div>
    <q-card class="latest-txs">
      <q-card-section class="justify-between flex align-center">
        <span class="text-subtitle2">Latest Transactions</span>
        <router-link to="/txs">View All</router-link>
      </q-card-section>
      <q-table
        :data="txs"
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
            <q-td key="hash">
              <span class="row justify-start items-center">
                <img src="svg/tx.svg" class="item-icon" />
                <span class="column text-left">
                  <fusion-hash :hash="props.row.hash" prefix="tx" />
                  <time-ago
                    tooltip="true"
                    :datetime="props.row.age * 1000"
                  />
                </span>
              </span>
            </q-td>
            <q-td key="sender">
              <div class="column">
                <div class="row justify-start">
                  <span class="field-key">
                    From
                  </span>
                  <fusion-hash
                    :hash="props.row.sender"
                    prefix="address"
                    :size="3"
                  />
                </div>
                <div class="row justify-start">
                  <span class="field-key">
                    To
                  </span>
                  <fusion-hash
                    :hash="props.row.receiver"
                    prefix="address"
                    :size="3"
                  />
                </div>
              </div>
            </q-td>
            <q-td key="receiver">
              <transaction-info :tx="props.row" />
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
import TransactionInfo from "@/components/transaction-info";
import TimeAgo from "vue2-timeago";
import { columns } from "./table-config";

export default {
  name: "latest-txs",
  props: {
    txs: Array
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
    TimeAgo,
    TransactionInfo
  }
};
</script>
