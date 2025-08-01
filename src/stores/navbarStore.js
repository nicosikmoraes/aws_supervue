import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'

export const useNavStore = defineStore('navbar', () => {
  // Variáveis
  const showNav = ref(true) //Variável para mostrar a navbar
  const showModal = ref(false) //Variável para mostrar a modal
  const route = useRoute()
  const offCanvas = ref(false) // Variável para controlar o offcanvas dos filtros

  // Garantindo que a navbar não seja exibida em páginas não desejadas
  if (route.path === '/') {
    showNav.value = true
  }

  if (route.path === '/login') {
    showNav.value = false
  }

  if (route.path === '/register') {
    showNav.value = false
  }

  if (route.path === '/config') {
    showNav.value = false
  }

  // Funções

  // Para mudar a navbar a "mão"
  function ActiveNav() {
    showNav.value = true //Função para mostrar a navbar
  }

  function InactiveNav() {
    showNav.value = false //Função para esconder a navbar
  }
  // Retornando
  return {
    showNav,
    showModal,
    offCanvas,
    ActiveNav,
    InactiveNav,
  }
})
