<template>
  <div class="container_navbar">
    <LogoComponent />

    <InputComponent v-if="show" />

    <div class="options">
      <OptionsComponent />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import InputComponent from './inputComponent.vue'
import LogoComponent from './logoComponent.vue'
import OptionsComponent from './optionsComponent.vue'

const show = ref(false)
</script>

<style scoped>
/* Estilos Container */
.container_navbar {
  position: absolute;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0px 20px;
  height: 70px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10; /* ⬅️ valor maior que o do banner */
}

.options {
  margin-left: auto;
}
</style>
