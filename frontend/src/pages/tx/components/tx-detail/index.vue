<template>
  <q-card class="tx__detail info-card" v-if="tx.hash">
    <div class="row">
      <div class="page-header">
        <img src="svg/tx.svg" alt="" class="page-icon" />
        <div class="tx-hash">
          <strong
            >Transaction
            <small class="item-label">{{ typeText }}</small>
          </strong>
          <div>
            <span class="is-hash">{{ tx.hash }}</span>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-6">
        <div class="key-info">
          <key-value prop="status" v-if="tx.hash">
            <span :class="statusCssClasses">{{ statusText }}</span>
          </key-value>
          <key-value prop="Timestamp" v-if="tx.timestamp">
            <time-ago
              tooltip="true"
              :datetime="tx.timestamp * 1000"
              long
              v-if="tx.timestamp"
            />
          </key-value>
          <key-value prop="from" v-if="txFrom">
            <fusion-hash
              :hash="txFrom"
              prefix="address"
              :use-abbrev="false"
              class="ellipsis"
            />
          </key-value>
          <key-value prop="to" v-if="txTo">
            <fusion-hash
              :hash="txTo"
              prefix="address"
              :use-abbrev="false"
              class="ellipsis"
            />
          </key-value>
          <key-value prop="Tx Summary" v-if="tx.hash">
            <transaction-info
              :tx="tx"
              v-if="!isErc20TokenCreation && !isContractCreation"
              style="min-width: 150px"
            />
            <div v-if="isErc20TokenCreation">
              Issued
              {{ tx.data.value }}
              <router-link :to="`/token/${tx.data.token}`">
                {{ tx.data.symbol }}
              </router-link>
            </div>
            <div v-if="isContractCreation">
              Created contract
              <fusion-hash :hash="tx.data.contract" prefix="contract" />
            </div>
          </key-value>
          <key-value prop="Duration" v-if="isTlTransfer">
            <fsn365-datetime :timestamp="tx.data.startTime" />
            ~
            <fsn365-datetime :timestamp="tx.data.endTime" />
            (UTC)
          </key-value>
        </div>
      </div>
      <div class="col-12 col-md-6">
        <div class="other-info">
          <key-value prop="block">
            <router-link :to="`/block/${tx.block}`">
              {{ tx.block }}
            </router-link>
            <small v-if="networkHeight" class="confirmation-text"
              >({{ confirmationText }})</small
            >
          </key-value>
          <key-value prop="Tx Fee" :value="fee" />
          <key-value prop="Gas Used" :value="tx.gasUsed" />
          <key-value prop="Gas Limit" :value="tx.gasLimit" />
          <key-value prop="nonce" :value="tx.nonce" />
          <key-value
            prop="Input Data"
            :value="tx.input"
            :ellipsis="true"
            :view-more="true"
          />
        </div>
      </div>
    </div>
    <!-- view transaction input -->
    <q-dialog v-model="showInput">
      <q-card>
        <q-card-section>
          <div class="text-h6">Transaction Input</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          {{ tx.input }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script>
import KeyValue from "@/components/key-value";
import FusionHash from "@/components/fusion-hash";
import TransactionInfo from "@/components/transaction-info";
import Fsn365Datetime from "@/components/fsn365-datetime";
import TimeAgo from "vue2-timeago";

export default {
  name: "tx-detail",
  props: {
    tx: {
      type: Object,
      required: true
    }
  },
  data() {
    return { showInput: false };
  },
  computed: {
    statusText() {
      if (this.tx.status === 0) return "Failed";
      else return "Success";
    },
    typeText() {
      const { type, data } = this.tx;

      switch (type) {
        case -1:
          return "Unknown Tx";
        case 0:
          return "Apply USAN";
        case 1:
          return "Issue Token";
        case 2:
          return "Transfer ";
        case 3:
          return "Transfer TimeLock";
        case 4:
          return "Make Swap";
        case 5:
          return "Recall Swap";
        case 6:
          return "Take Swap";
        case 7:
          return "Empty Func";
        case 8:
          return "Report Illegal";
        case 9:
          return "Anyswap Trades";
        case 10:
          return "Add Liquidity";
        case 11:
          return "Remove Liquidity";
        case 12: {
          if (data.symbol) return "Issue Token";
          else return "Create Contract";
        }
        default:
          return "Buy Ticket";
      }
      return txType;
    },
    statusCssClasses() {
      if (this.tx.status) {
        return "status-text is-green";
      } else {
        return "status-text is-red";
      }
    },
    txFrom() {
      return this.tx.sender || this.tx.from;
    },
    txTo() {
      return this.tx.receiver || this.tx.to;
    },
    fee() {
      const { gasPrice, gasUsed } = this.tx;
      const fee = (gasPrice * gasUsed) / Math.pow(10, 18);
      return fee + " FSN";
    },
    networkHeight() {
      return this.$store.state.network.height;
    },
    confirmationText() {
      const gap = this.$store.state.network.height - this.tx.block;
      if (gap > 1) return `${gap} Blocks confirmations`;
      else return `${gap} Block confirmation`;
    },
    isFsnSwap() {
      const txType = this.tx.type;
      return [4, 5, 6].includes(txType);
    },
    isTlTransfer() {
      return !!this.tx.data.startTime;
    },
    isErc20TokenCreation() {
      const { type, data = {} } = this.tx;
      return type === 12 && !!data.symbol;
    },
    isContractCreation() {
      const { type, data = {} } = this.tx;
      return type === 12 && data.symbol === undefined;
    }
  },
  components: {
    KeyValue,
    FusionHash,
    TimeAgo,
    Fsn365Datetime,
    TransactionInfo
  }
};
</script>
