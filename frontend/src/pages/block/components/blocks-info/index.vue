<style lang="scss" scoped>
.bk {
  &-number {
    font-size: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
}
.nav-btn {
  cursor: pointer;
  border: 1px solid #eee;
  padding: 0 8px;
  height: 16px;
  line-height: 16px;
  border-radius: 4px;
  color: #4f4f4f;
  &:hover {
    border-color: $primary;
    color: $primary;
  }
  &--prev {
    margin-left: 4px;
    margin-right: 4px;
  }
}
</style>

<template>
  <q-card class="info-card block__info">
    <div class="page-header">
      <img src="svg/block.svg" class="page-icon" />
      <div class="bk-number">
        <strong>
          Block
        </strong>
        <div class="row items-center justify-start">
          <span>{{ number }}</span>
          <span
            v-if="number > 0"
            @click="toBlock(+number - 1)"
            class="nav-btn nav-btn--prev"
          >
            {{ prevText }}</span
          >
          <span
            v-if="networkHeight > number"
            @click="toBlock(+number + 1)"
            class="nav-btn"
          >
            {{ nextText }}
          </span>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-12 col-md-6">
        <div class="key-info">
          <key-value prop="Timestamp">
            <time-ago
              tooltip="true"
              :datetime="block.timestamp * 1000"
              long
              v-if="block.timestamp"
            />
          </key-value>
          <key-value prop="Mined By">
            <fusion-hash
              :hash="block.miner"
              prefix="address"
              :use-abbrev="false"
              v-if="block.miner"
            />
          </key-value>
          <key-value prop="Block Reward" :value="reward" />
          <key-value prop="Transactions" :value="txs" />
          <key-value prop="Hash" :value="block.hash" :tool-tip="true" />
        </div>
        <key-value
          prop="Retreat Miners"
          :value="retreatMiners"
          v-if="hashRetreat"
        />
      </div>
      <div class="col-12 col-md-6">
        <div class="other-info">
          <key-value prop="Total Difficulty" :value="totalDifficulty" />
          <key-value prop="Difficulty" :value="difficulty" />
          <key-value prop="Size" :value="size" />
          <key-value prop="Average Gas Price" :value="block.avgGasprice" />
          <key-value prop="Gas Limit" :value="gasLimit" />
          <key-value
            prop="Parent Hash"
            :value="block.parentHash"
            :tool-tip="true"
          />

          <key-value
            prop="Retreat Tickets"
            :value="retreatTickets"
            v-if="hashRetreat"
          />
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
import KeyValue from "@/components/key-value";
import FusionHash from "@/components/fusion-hash";
import TimeAgo from "vue2-timeago";

export default {
  name: "blocks-info",
  props: {
    block: {
      type: Object,
      required: true
    }
  },
  computed: {
    reward() {
      return this.block.reward + " FSN";
    },
    number() {
      return this.block.height + "";
    },
    txs() {
      return this.block.txs + "";
    },
    difficulty() {
      return this.block.difficulty + "";
    },
    totalDifficulty() {
      return this.block.totalDifficulty + "";
    },
    size() {
      return this.block.size + "";
    },
    blocktime() {
      return this.block.blockTime + "";
    },
    gasLimit() {
      return this.block.gasLimit + "";
    },
    retreatMiners() {
      return JSON.stringify(this.block.retreatMiners);
    },
    retreatTickets() {
      return JSON.stringify(this.block.retreatTickets);
    },
    hashRetreat() {
      return this.block.retreatTickets && this.block.retreatTickets.lenght;
    },
    networkHeight() {
      return this.$store.state.network.height;
    },
    nextText() {
      return ">";
    },
    prevText() {
      return "<";
    }
  },
  components: {
    KeyValue,
    TimeAgo,
    FusionHash
  },
  methods: {
    toBlock(number) {
      this.$router.push(`/block/${number}`);
    }
  }
};
</script>
