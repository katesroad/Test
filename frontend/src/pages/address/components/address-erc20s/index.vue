<template>
  <div>
    <p class="card-tip">
      <small
        ><strong>ERC20 tokens</strong> are issued by smart contract on fusion
        blockchain platform.</small
      >
    </p>
    <q-table
      :data="data"
      :columns="columns"
      row-key="id"
      :loading="loading"
      class="address__erc20s"
      color="primary"
      :pagination.sync="pagination"
      :rows-per-page-options="rowsPerPageOptions"
      flat
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="token">
            <router-link :to="`/token/${props.row.token}`">
              {{ props.row.symbol }}
            </router-link>
          </q-td>
          <q-td key="qty" :props="props">
            <calc-qty :qty="props.row.qty" :tooltip="true"  :fixed="7" />
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>
>

<script>
import CalcQty from '@/components/calc-qty';
import { columns } from "./table-config";

export default {
  name: "address-erc20s",
  props: {
    hash: {
      type: String,
      required: true
    }
  },
  data() {
    const rowsPerPageOptions = this.$store.state.ROW_OPTIONS_FOR_PAGE
      .ROW_OPTIONS_FOR_DETAIL_PAGE;
    const rowsPerPage = rowsPerPageOptions[0];
    return {
      loading: false,
      pagination: { rowsPerPage },
      rowsPerPageOptions,
      columns,
      data: []
    };
  },
  watch: {
    hash() {
      this.getBalance();
    }
  },
  components: {
    CalcQty
  },
  created() {
    this.getBalance();
  },
  methods: {
    async getBalance() {
      this.loading = true;
      const balance = await this.$axios.get(`/address/${this.hash}/erc20s`);
      this.loading = false;
      this.data = balance;
    },
  }
};
</script>
