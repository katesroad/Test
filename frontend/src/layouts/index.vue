<style lang="scss">
@import "./style.scss";
</style>

<template>
  <q-layout>
    <q-page-container style="margin-bottom: 4rem">
      <page-header :toggle-drawer="toggleDrawer" />
      <q-page style="margin-bottom: 2rem;">
        <router-view />
      </q-page>
    </q-page-container>
    <q-drawer v-model="right" side="right" behavior="mobile" elevated>
      <sidebar :toggle-drawer="toggleDrawer" />
    </q-drawer>
    <page-footer />
  </q-layout>
</template>

<script>
import PageHeader from "@/components/page-header";
import PageFooter from "@/components/page-footer";
import Sidebar from "@/components/sidebar";

export default {
  name: "layout",
  data() {
    const showSearch = this.$route.path !== "/";
    return { right: false, showSearch, atHomePage: true };
  },
  watch: {
    $route() {
      const path = this.$route.path;
      if (path === "/") {
        this.showSearch = false;
        this.atHomePage = true;
      }
      else {
        this.showSearch = true;
        this.atHomePage = false;
      }
    }
  },
  computed: {},
  components: {
    PageHeader,
    PageFooter,
    Sidebar,
  },
  methods: {
    toggleDrawer() {
      this.right = !this.right;
    }
  }
};
</script>
