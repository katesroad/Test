<style lang="scss" scoped>
@import url("./style.scss");
</style>

<template>
  <q-footer>
    <div class="site-intro footer-ctn">
      <div class="site-intro__fsn">
        <h6 class="text-h6">
          Powered by
          <a href="https://www.fusion.org/" target="_blank" class="text-white"
            >Fusion</a
          >
          and
          <a
            href="https://github.com/fsn-dev"
            target="_blank"
            class="text-white"
            >FOSC</a
          >
        </h6>
        <p>
          Fsn365 is a blockchain explorer and analytics platform for fusion, a
          connected ecosystem for financial transactions.
        </p>
      </div>
      <div class="site-intro__about">
        <h6 class="text-h6">About</h6>
        <p>
          Made with love and coffee by
          <a href="https://katecc.com">Kate</a>.
           Donation:
          <router-link to="/address/10139396">
          10139396
          </router-link>
        </p>
      </div>
    </div>
    <div class="line">
      <span></span>
    </div>
    <div class="copyright footer-ctn">
      <p>Copyright all reserved @2020</p>
      <p>
        <a href="https://github.com/katesroad/fsn365dotcom" target="_blank">github</a>
        <a href="https://twitter.com/fsn365" target="_blank">twitter</a>
      </p>
    </div>
  </q-footer>
</template>

