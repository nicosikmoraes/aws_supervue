import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useUserStore } from './userStore'

export const useAddressStore = defineStore('address', () => {
  // Variáveis
  const userStore = useUserStore()

  // País
  const countries = ref([])
  const selectedCountry = ref('BR')

  // Estado
  const states = ref([])
  const selectedState = ref('')
  const stateSign = ref('')

  // Cidades 
  const cities = ref([])
  const selectedCity = ref('')

  //Rua
  const street = ref('')
  const number = ref(null)

  // CEP
  const cep = ref('')

  const addresses = ref([])
  const selectedAddress = ref([])
  // Funções

  async function getCountries() { // Pega todos os países
    try {
      const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,cca2')

      // Ordena os países em ordem alfabética
      countries.value = response.data.sort((a, b) => a.name.common.localeCompare(b.name.common))
    } catch (err) {
      console.error('Erro ao obter países:', err.response?.data || err.message)
      return null
    }
  }

  async function getBrazilianStates() { // Pega os estados brasileiros
    try {
      const response = await axios.get(
        'https://servicodados.ibge.gov.br/api/v1/localidades/estados',
      )

      // Ordena os estados em ordem alfabética
      states.value = response.data.sort((a, b) => a.nome.localeCompare(b.nome))

      return response.data
    } catch (err) {
      console.error('Erro ao obter estados:', err.response?.data || err.message)
      return null
    }
  }

  async function getCitiesByState(state) { // Pega as cidades por estado
    try {
      const response = await axios.get(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`,
      )

      // Ordena as cidades em ordem alfabética
      cities.value = response.data.sort((a, b) => a.nome.localeCompare(b.nome))
    } catch (err) {
      console.error('Erro ao obter cidades:', err.response?.data || err.message)
      return null
    }
  }

  async function createAddress() { // Cria um novo endereço
    try {
      const response = await axios.post(
        '/back/addresses/',
        {
          street: street.value,
          number: number.value,
          zip: cep.value,
          city: selectedCity.value.nome,
          state: selectedState.value,
          country: selectedCountry.value,
        },
        {
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userStore.userMe.token}`,
          },
        },
      )

      return response.data
    } catch (err) {
      console.error('Erro ao criar endereço:', err.response?.data || err.message)
      return null
    }
  }

  async function getAddresses() {  // Pega todos os endereços
    try {
      const response = await axios.get('/back/addresses/', {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${userStore.userMe.token}`,
        },
      })

      // Adiciona a propriedade 'checked' (inicialmente false) a cada endereço
      addresses.value = response.data.map((address) => ({
        ...address,
        checked: false,
      }))

      return addresses.value
    } catch (err) {
      console.error('Erro ao obter endereços:', err.response?.data || err.message)
      return null
    }
  }

  async function deleteAddress(id) { // Deleta um endereço
    try {
      const response = await axios.delete(`/back/addresses/${id}`, {
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${userStore.userMe.token}`,
        },
      })

      await getAddresses() // Atualiza os endereços
      return response.data
    } catch (err) {
      console.error('Erro ao deletar endereço:', err.response?.data || err.message)
      return null
    }
  }

  // Retornando
  return {
    countries,
    selectedCountry,
    states,
    selectedState,
    stateSign,
    cities,
    selectedCity,
    street,
    number,
    cep,
    addresses,
    selectedAddress,
    getCitiesByState,
    getCountries,
    getBrazilianStates,
    createAddress,
    getAddresses,
    deleteAddress,
  }
})
