<style lang="scss">
@import url("./style.scss");
</style>

<template>
  <div class="address-detail">
    <address-overview :overview="overview" :loading="loading" />
    <q-card>
      <q-tabs v-model="tab" class="text-primary primary bg-white" align="left">
        <q-tab name="txs" label="Transactions" no-ripple v-if="hasTxs" />
        <q-tab
          name="fusion-tokens"
          label="Native Tokens"
          no-ripple
          v-if="hasFusionTokens"
        />
        <q-tab
          name="erc20-tokens"
          label="ERC20 Tokens"
          no-ripple
          v-if="hasErc20Tokens"
        />
        <q-tab
          name="tl-tokens"
          label="Timelock Tokens"
          no-ripple
          v-if="hasTlTokens"
        />
        <q-tab
          name="native-swaps"
          label="Native Swaps"
          no-ripple
          v-if="hasNativeSwaps"
        />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab">
        <q-tab-panel name="txs" v-if="hasTxs">
          <address-txs
            :txs="overview.txs"
            :anchor="overview.anchor"
            :address="hash"
          />
        </q-tab-panel>
        <q-tab-panel name="fusion-tokens" v-if="hasFusionTokens && tab==='fusion-tokens'">
          <address-tokens :hash="hash" />
        </q-tab-panel>
        <q-tab-panel name="erc20-tokens" v-if="hasErc20Tokens &&tab==='erc20-tokens'">
          <address-erc20s :hash="hash" />
        </q-tab-panel>
        <q-tab-panel name="tl-tokens" v-if="hasTlTokens &&tab==='tl-tokens' && overview.hash">
          <address-tl-tokens :hash="overview.hash" />
        </q-tab-panel>
        <q-tab-panel name="native-swaps" v-if="hasNativeSwaps &&tab==='native-swaps'">
          <address-swaps :hash="hash" />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </div>
</template>

<script>
import AddressTxs from "./components/address-txs";
import AddressOverview from "./components/address-overview/index.vue";

export default {
  name: "address-detail",
  data() {
    return {
      overview: {},
      tabs: [],
      tab: "txs",
      loading: true
    };
  },
  computed: {
    hash() {
      return this.$route.params.hash;
    },
    hasTlTokens() {
      return this.overview.tl_tokens > 0;
    },
    hasErc20Tokens() {
      return this.overview.erc20_tokens > 0;
    },
    hasFusionTokens() {
      return this.overview.fusion_tokens > 0;
    },
    hasTxs() {
      return this.overview.txs > 0;
    },
    hasNativeSwaps() {
      return this.overview.swaps > 0;
    }
  },
  watch: {
    hash() {
      this.loadData();
    }
  },
  components: {
    AddressOverview,
    AddressTxs,
    AddressTokens: () => import("./components/address-tokens"),
    AddressTlTokens: () => import("./components/address-tl-tokens"),
    AddressErc20s: () => import("./components/address-erc20s"),
    AddressSwaps: () => import("./components/address-swaps")
  },
  created() {
    this.loadData();
  },
  methods: {
    async loadData() {
      this.loading = true;
      const overview = await this.$axios
        .get(`/address/${this.hash}`)
        .catch(e => {
          this.$q.notify({
            position: "top",
            color: "warning",
            message: `Someting happended when loading address ${this.hash}`
          });
          return {};
        });
      this.loading = false;
      this.overview = overview;
      if (this.overview.erc20) {
        this.$router.replace(`/token/${this.hash}`);
      }
    }
  }
};
</script>
