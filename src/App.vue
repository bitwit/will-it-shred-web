<template>
  <div id="app">
    <div class="container">
      <h1>
        <img class="logo" src="./assets/community-logo.svg" />
        <span>Will It Shred?</span>
      </h1>
      <ShredderCalculator :inputData="inputData" />
    </div>
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

div.container {
  width: 640pt;
  margin: 0 auto;
}

h1 {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
}
img.logo {
  display: block;
  width: 100pt;
}
</style>
