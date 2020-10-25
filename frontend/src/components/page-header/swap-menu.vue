<template>
  <q-btn-dropdown
    v-model="menu"
    label="Swaps"
    no-caps
    dense
    @mouseover.native="menuOver = true"
    @mouseout.native="menuOver = false"
    class="blockchain-btn"
  >
    <q-list
      @mouseover.native="listOver = true"
      @mouseout.native="listOver = false"
      dense
    >
      <q-item clickable>
        <q-item-section>
          <router-link to="/anyswap">
            Anyswap
          </router-link>
        </q-item-section>
      </q-item>
      <q-separator></q-separator>
    </q-list>
  </q-btn-dropdown>
</template>

<script>
import { debounce } from "quasar";

export default {
  name: "blockchain-menu",
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
    onItemClick() {
      console.log("Clicked on an Item");
    },
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
