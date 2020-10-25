<template>
  <q-card>
    <transaction-list title="Transactions" class="txs" />
  </q-card>
</template>
<script>
import TransactionList from "@/components/transaction-list";

export default {
  name: "txs",
  components: {
    TransactionList
  }
};
</script>
