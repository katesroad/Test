<style lang="scss">
@import url("./style.scss");
</style>

<template>
  <div class="home">
    <slogan />
    <search-form class="search-form home__search"  :show-btn="true" />
    <network-latest :outline="true" class="home__latest" />
  </div>
</template>

<script>
import SearchForm from "@/components/search-form";
// import Network from "./components/network";
import NetworkLatest from "./components/network-latest";
import Slogan from './components/slogan'

export default {
  name: "home",
  components: {
    NetworkLatest,
    SearchForm,
    Slogan
  }
};
</script>
