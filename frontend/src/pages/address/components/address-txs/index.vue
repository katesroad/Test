<template>
  <div class="address-txs">
    <p class="card-tip">
      <small
        ><a href="https://anyswap.exchange/dashboard" target="_blank"
          >Anyswap Exchange</a
        >
        transactions are included.</small
      >
    </p>
    <txs :address="address" :txs.sync="txs"  />
  </div>
</template>

<script>
import Txs from "@/components/transaction-list";

export default {
  name: "address-txs",
  props: {
    address: {
      type: String,
      required: true
    },
    txs: {
      type: Number,
      required: true
    }
  },
  components: {
    Txs
  }
};
</script>
