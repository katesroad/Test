<template>
  <q-card>
    <span>Latest Block</span>
    <span>{{ network.height }}</span>
    <span>Staked</span>
    <span>{{ staked }}</span>
    <span> Miners</span><span>{{ network.miners }}</span> <span>BlockTime</span
    ><span>{{ network.blocktime }} s</span>
  </q-card>
</template>

<script>
export default {
  name: "network-state",
  props: {
    network: Object
  },
  computed: {
    staked() {
      if (!this.network) return;
      const { supply, staked } = this.network;
      return ((staked / supply) * 100).toFixed(2) + "%";
    }
  }
};
</script>
