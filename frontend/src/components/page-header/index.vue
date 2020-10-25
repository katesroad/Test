<style lang="scss" scoped>
@import url("./style.scss");
</style>

<template>
   <q-header class="bg-transparent">
      <section :class="headerClasses">
         <q-toolbar class="flex row items-center">
            <q-toolbar-title>
               <router-link to="/" class="row items-center"
                  ><img src="svg/logo.svg"
                  /></router-link>
            </q-toolbar-title>
            <search-form
               v-if="!atHomePage"
               :dense="true"
               :outline="true"
               class="search-form"
               />
            <blockchain-menu />
            <token-menu />
            <swap-menu />
            <!-- <router-link to="/news">News </router-link> -->
            <q-btn
               flat
               round
               dense
               icon="menu"
               class="q-header__menu"
               @click="toggleDrawer"
               />
         </q-toolbar>
      </section>
      <search-form class="search-form  search-form--mobile bg-white shadow-1" v-if="!atHomePage"  :show-btn="true" />
   </q-header>
</template>

<script>
import SearchForm from "@/components/search-form";
import BlockchainMenu from "./blockchain-menu";
import TokenMenu from "./token-menu";
import SwapMenu from "./swap-menu";

export default {
  name: "page-header",
  props: {
    toggleDrawer: {
      type: Function,
      required: true
    }
  },
  data() {
    return { drawerRight: false, width: 200 };
  },
  watch: {
    drawerRight() {
      if (this.drawerRight) {
        this.width = 200;
      } else this.width = 0;
      console.log(this.width);
    }
  },
  computed: {
    atHomePage() {
      return this.$route.path === "/";
    },
    headerClasses() {
      if(this.atHomePage) return '';
      else return 'with-shadow'
    }
  },
  components: {
    SearchForm,
    BlockchainMenu,
    TokenMenu,
    SwapMenu
  }
};
</script>
