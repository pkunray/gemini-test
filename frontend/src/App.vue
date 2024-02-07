<template>
  <div id="app">
    <h1>Gemini Multimodal API Test</h1>
    <GeminiTester />
  </div>
</template>

<script>
import GeminiTester from '@/components/GeminiTester.vue';

export default {
  name: 'App',
  components: {
    GeminiTester
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #df4807;
  margin-top: 60px;
}

</style>
