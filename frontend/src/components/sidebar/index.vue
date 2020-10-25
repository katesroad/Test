<style lang="scss" scoped>
@import url('./style.scss')
</style>

<template>
  <nav class="sidebar">
    <ul>
      <li class="row justify-between items-center sidebar-header">
        <img src="svg/logo.svg" alt="" class="">
        <span class="btn-close" @click="toggleDrawer">x</span>
      </li>
      <li class="category">
        <span class="category__name">Blockchain</span>
        <ul>
          <li>
            <router-link to="/blocks">Blocks</router-link>
            </li>
          <li>
            <router-link to=/txs>Transactions</router-link>
            </li>
        </ul>
      </li>
      <li class="category">
        <span class="category__name">Tokens</span>
        <ul>
          <li><router-link to="/tokens?type=0">Native Tokens</router-link></li>
          <li>
            <router-link to="/tokens?type=1">FRC20 Tokens</router-link>
          </li>
        </ul>
      </li>
      <li class="category">
      <span class="category__name">Swaps</span>
        <ul>
          <li>
            <router-link to='/anyswap'>anyswap</router-link>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: 'fsn365-sidebar',
  props: {
    toggleDrawer: {
      type: Function,
      required: true
    }
  }
}
</script>