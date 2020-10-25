<style lang="scss" scoped>
@import url('./style.scss');
</style>

<template>
  <q-input
    v-model="keyword"
    @change="doSearch"
    :loading="loading"
    label="Search address, token, transaction, block"
    :dense="dense"
    outlined 
    color="primary"
    >
    <template v-slot:append>
      <span @click="doSearch">
        <q-btn color="primary" v-if="showBtn" class="search-btn">
          <q-icon name="search" />
        </q-btn>
        <q-icon name="search" v-else/>
      </span>
    </template>
  </q-input>
</template>

<script>
import { debounce, Notify } from "quasar";

export default {
  name: "search-fusion",
  props: {
    dense: Boolean,
    outline: Boolean,
    showBtn: Boolean,
  },
  data() {
    return { keyword: "", loading: false };
  },
  computed: {
    networkHeight() {
      return this.$store.state.network.height;
    }
  },
  methods: {
    doSearch: debounce(async function() {
      if(this.loading) return;
      const keyword = this.keyword.trim();
      if (!keyword) return;
      if (this.isBlockNumber(keyword)) {
        const address = await this.searchAddress(keyword);
        this.loading = false;
        if (address.hash) {
          return this.$$router.push(`address/${address.hash}`);
        }
        else {
          this.$router.push(`/block/${keyword}`);
        }
      }

      const msg = `Sorry, we d't find anything with keyword ${keyword}`;
      this.loading = true;
      const promises = [];
      if (keyword.length == 42 || keyword.length == 66) {
        promises.push(this.searchToken(keyword));
        promises.push(this.searchTx(keyword));
        promises.push(this.searchAddress(keyword));
      } else {
        this.loading = false;
        return this.showNotify(msg);
      }

      const result = await Promise.all(promises).then(data => {
        const [token, tx, address] = data;
        return { ...token, ...tx, ...address };
      });

      this.loading = false;
      if (!Object.keys(result).length) {
        return this.showNotify(msg);
      }
      const { address, token, tx, block } = result;
      if (address) {
        return this.$router.push(`/address/${address}`);
      }
      if (token) {
        return this.$router.push(`/token/${token}`);
      }
      if (tx) {
        return this.$router.push(`/tx/${tx}`);
      }
    }, 50),
    isBlockNumber(val) {
      const number = +val;
      const isNumber = /^[0-9]*$/.test(val);
      if (!isNumber) return false;
      if (number >= 0 && number <= this.networkHeight) return true;
      else return false;
    },
    showNotify(msg) {
      this.$q.notify({
        message: msg,
        position: "top",
        color: "warning"
      });
    },
    searchTx(tx) {
      return this.$axios
        .get(`/tx/${tx}`)
        .then(data => {
          if (data && data.hash) return { tx };
        })
        .catch(e => ({}));
    },
    searchToken(token) {
      return this.$axios
        .get(`/token/${token}`)
        .then(data => {
          if (data && data.hash) return { token };
          return {};
        })
        .catch(e => ({}));
    },
    searchAddress(address) {
      return this.$axios
        .get(`/address/${address}`)
        .then(data => {
          if (data && data.hash) return { address };
        })
        .catch(e => ({}));
    }
  }
};
</script>
