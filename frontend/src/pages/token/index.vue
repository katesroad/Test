<style lang="scss">
@import "./style.scss";
</style>

<template>
  <div class="token-detail">
    <token-info :token="token" :loading="loading" />
    <q-card>
      <q-tabs
        v-model="tab"
        :breakpoint="0"
        class="text-primary primary bg-white"
        align="left"
      >
        <q-tab name="txs" label="Transactions" no-ripple />
        <q-tab name="holders" label="Holders" no-ripple v-if="token.holders" />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab">
        <q-tab-panel name="txs">
          <p class="card-tip"  v-if="showTip">
            <small
              ><a href="https://anyswap.exchange/dashboard" target="_blank"
                >Anyswap Exchange</a
              >
              transactions are included.</small
            >
          </p>
          <token-txs :token="hash" :txs="token.txs" />
        </q-tab-panel>
        <q-tab-panel name="holders" v-if="token.holders">
          <token-holders
            :hash="hash"
            :token-symbol="token.symbol"
            :token-qty="tokenQty"
            :holders="token.holders"
          />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </div>
</template>

<script>
import TokenTxs from "@/components/transaction-list";
import TokenInfo from "./components/token-info";
import TokenHolders from "./components/token-holders";

export default {
  name: "token-detail",
  data() {
    return {
      token: {},
      tab: "txs",
      loading: true
    };
  },
  computed: {
    hash() {
      const hash = this.$route.params.hash;
      if(hash) return hash.trim();
      return hash;
    },
    tokenQty() {
      const isFSN = this.$utils.isFSNToken(this.hash);
      if (isFSN) {
        return this.$store.state.network.supply;
      }
      return +this.token.qty;
    },
    showTip () {
      const token = this.hash;
      return this.token.length === 42 || this.$utils.isFSNToken(token);
    }
  },
  watch: {
    hash() {
      this.tab = "txs";
      this.loadData();
    }
  },
  components: {
    TokenInfo,
    TokenHolders,
    TokenTxs
  },
  created() {
    this.loadData();
  },
  methods: {
    async loadData() {
      this.loading = true;
      const token = await this.$axios.get(`/token/${this.hash}`).catch(e => {
        this.$q.notify({
          position: "top",
          message: `Something happened when loading token ${this.hash}`,
          color: "warning"
        });
        return {};
      });
      this.loading = false;
      this.token = token;
    }
  }
};
</script>
