<style lang="scss" scoped>
.address {
  &-icon {
    width: 46px;
  }
  &-hash {
    display: block;
    word-break: break-all;
  }
}
</style>

<template>
  <q-card class="address__overview info-card">
    <div class="page-header">
      <img src="svg/address.svg" alt="" class="page-icon" />
      <div class="address-number">
        <strong>
          Address
          <small v-if="label" class="item-label">{{ label }}</small>
          <a
            :href="miningPage"
            target="_blank"
            class="item-label"
            v-if="overview.miner"
            ><small>mining</small></a
          >
          <small class="item-label" v-if="overview.contract">contract</small>
        </strong>
        <span class="address-hash">{{ overview.hash }}</span>
      </div>
    </div>
    <div class="row">
      <div class="col-12 col-md-6">
        <div class="key-info">
          <key-value prop="USAN" :value="overview.usan" />
          <key-value prop="∞ Balance" :value="tlBalance" />
          <key-value
            prop="Contract Address"
            :value="contractText"
            v-if="overview.contract"
          />
        </div>
      </div>
      <div class="col-12 col-md-6">
        <div class="other-info">
          <key-value prop="Balance" :value="balance" />
          <key-value prop="Transactions" :value="overview.txs" />
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
import KeyValue from "@/components/key-value";

export default {
  name: "address-overview",
  props: {
    overview: {
      type: Object,
      required: true
    }
  },
  computed: {
    balance() {
      return (this.overview.fsn || 0) + " FSN";
    },
    tlBalance() {
      return (this.overview.fsn_in || 0) + " FSN";
    },
    contractText() {
      if (this.overview.contract) return "Yes";
      else return "No";
    },
    label() {
      const labelMap = this.$store.state.addressNames;
      return labelMap[this.overview.hash];
    },
    miningPage() {
      return `https://fusionmining.org/miner/${this.overview.hash}`;
    }
  },
  components: {
    KeyValue
  }
};
</script>
