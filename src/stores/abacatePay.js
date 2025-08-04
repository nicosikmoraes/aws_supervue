import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useCartStore } from './cartStore'

export const usePayStore = defineStore('pay', () => {
  // Variáveis

  // Stores
  const cartStore = useCartStore()

  const abacateToken = ref('abc_dev_rRMxM25fNhmmGWyPhQATN45d')
  const payData = ref([])
  const qrCode = ref('')

  // Funções
  async function createPixQrCode() {  // Criar o QRCode
    try {
      const response = await axios.post('pay/api/pix', {
        amount: Number(cartStore.cartItems.total_amount) * 100,
        expiresIn: 36000,
        description: 'Pagamento com abacatepay',
      })

      qrCode.value = response.data.qrCode
      payData.value = response.data

      // Retorna o QRCode gerado
      return response.data.qrCode
    } catch (err) {
      console.error('Erro ao criar QRCode:', err.response?.data || err.message)
      return null
    }
  }

  async function simulatePayment() { // Simular o pagamento
    try {
      const response = await axios.post(
        `pay/api/pixQrCode/simulate-payment?id=${payData.value.data.id}`,
        {
          metadata: {},
        },
      )

      return response.data
    } catch (err) {
      console.error('Erro ao simular pagamento:', err.response?.data || err.message)
      return null
    }
  }

  // Retornando
  return {
    abacateToken,
    payData,
    qrCode,
    createPixQrCode,
    simulatePayment,
  }
})
