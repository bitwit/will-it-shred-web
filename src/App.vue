<template>
  <div id="app">
    <ShredderCalculator :inputData="inputData" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import ShredderCalculator from './components/ShredderCalculator.vue';
import { InputData } from './DataStructure'
const inputData = require("./data.yml") as InputData

export default Vue.extend({
  name: 'App',
  components: {
    ShredderCalculator
  },
  data: function() {
    return {
      inputData: inputData.shredders[0]
    }
  }
});
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
