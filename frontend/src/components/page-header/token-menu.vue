<template>
  <q-btn-dropdown
    v-model="menu"
    label="Tokens"
    no-caps
    dense
    @mouseover.native="menuOver = true"
    @mouseout.native="menuOver = false"
    class="token-btn"
  >
    <q-list
      @mouseover.native="listOver = true"
      @mouseout.native="listOver = false"
      dense
    >
      <q-item clickable v-close-popup>
        <q-item-section>
          <router-link to="/tokens?type=0">
            Native Tokens
          </router-link>
        </q-item-section>
      </q-item>
      <q-separator></q-separator>
      <q-item clickable v-close-popup>
        <q-item-section>
          <router-link to="/tokens?type=1">FRC20 Tokens </router-link>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script>
import { debounce } from "quasar";

export default {
  name: "token-menu",
  data() {
    return {
      menu: false,
      menuOver: false,
      listOver: false
    };
  },
  methods: {
    debounceFunc: debounce(function() {
      this.checkMenu();
    }, 100),
    checkMenu() {
      if (this.menuOver || this.listOver) {
        this.menu = true;
      } else {
        this.menu = false;
      }
    }
  },
  watch: {
    menuOver(val) {
      this.debounceFunc();
    },
    listOver(val) {
      this.debounceFunc();
    }
  }
};
</script>
