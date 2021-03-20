<script>
import Vue from 'vue';
import VueImageSlim from '@/vue-image-slim.vue';

export default Vue.extend({
  name: 'ServeDev',
  components: {
    VueImageSlim
  }
});
</script>

<template>
  <div id="app">
    <vue-image-slim />
  </div>
</template>
