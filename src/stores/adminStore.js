import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from './userStore'
import axios from 'axios'
import { useRoute } from 'vue-router'
import { useLandingStore } from './landingStore'

export const useAdminStore = defineStore('admin', () => {
  // Variáveis
  const products = ref([])
  const categories = ref([])
  const route = useRoute()

  //Stores
  const userStore = useUserStore()
  const landingStore = useLandingStore()

  //Mostrar Componentes
  const showCategories = ref(true)
  const showProducts = ref(true)
  const editProduct = ref(false)

  //IDs
  const idSelected = ref(null)
  const idProductSelected = ref(null)

  //Loading
  const loadingProducts = ref(false)

  const filtered = ref([])

  //Caminho padrão da API
  const api = axios.create({
    baseURL: '/back',
  })

  // Funções

  // Função para criar um novo moderador
  async function createModerator(moderator) {
    try {
      const response = await api.post(
        '/users/create-moderator',
        {
          name: moderator.name,
          email: moderator.email,
          password: moderator.password,
          role: 'MODERATOR',
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
      console.log('Erro no createModerator:', err.response?.data || err.message)
      return null
    }
  }

  // Função para criar uma nova categoria
  async function createCategory(data) {
    const formData = new FormData()

    formData.append('name', data.name)

    if (data.description) {
      formData.append('description', data.description)
    }

    if (data.imageFile) {
      formData.append('image', data.imageFile)
    }

    try {
      const response = await api.post('/categories/', formData, {
        headers: {
          accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userStore.userMe.token}`,
        },
      })

      return response.data
    } catch (err) {
      console.log('Erro no createCategory:', err.response?.data || err.message)
      return null
    }
  }

  async function getCategories() { // Buscar todas as categorias
    try {
      const res = await api.get(`/categories/user/144`, {
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userStore.userMe.token}`,
        },
      })

      const cats = res.data
      categories.value = cats.map((cat) => ({
        ...cat,
        selected: false, // Inicializa o estado selecionado como falso
      }))

      return categories.value
    } catch (err) {
      console.log('Erro no getCategories:', err.response?.data || err.message)
      return null
    }
  }

  async function deleteCategory(id) { // Deletar uma categoria
    try {
      const response = await api.delete(`/categories/${id}`, {
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userStore.userMe.token}`,
        },
      })

      return response.data
    } catch (err) {
      console.log('Erro no deleteCategory:', err.response?.data || err.message)
      return null
    }
  }

  async function createProduct(data) {  // Criar um novo produto
    try {
      //Formatando os dados
      const formData = new FormData()

      // Formata os dados
      formData.append('name', data.name)
      formData.append('price', data.price)
      formData.append('stock', data.stock)

      if (!idSelected.value) { // Se não tiver nenhuma categoria selecionada, retorna um erro
        throw new Error('Nenhuma categoria selecionada')
      }

      formData.append('category_id', idSelected.value)

      //Formata os dados só se eles existirem já que são opcionais
      if (data.description) {
        formData.append('description', data.description)
      }

      if (data.imageFile) {
        formData.append('image', data.imageFile)
      }

      //Faz a requisição
      const response = await api.post('/products/', formData, {
        headers: {
          accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userStore.userMe.token}`,
        },
      })

      return response.data
    } catch (err) {
      console.log('Erro no createProduct:', err.response?.data || err.message)
      return null
    }
  }

  async function updateProduct(data) { // Atualizar um produto
    
    // Só muda a imagem se for adicionada uma nova
    if (
      data.imageFile !==
      products.value.find((product) => product.id === idProductSelected.value).image_path
    ) {
      console.log('Imagem alterada')
      await updateImg(data.imageFile)
    }

    await updateStock(data.stock) // Atualiza o estoque

    try {
      const response = await api.put(
        `/products/${idProductSelected.value}`,
        {
          name: data.name,
          price: data.price,
          description: data.description,
          category_id: idSelected.value,
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
      console.log('Erro no editProduct:', err.response?.data || err.message)
      return null
    }
  }

  async function updateStock(stock) { //Atualiza o estoque do produto
    try {
      const response = await api.put(
        `/products/${idProductSelected.value}/stock`,
        {
          stock: stock,
        },
        {
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userStore.stockToken}`, //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxNDQiLCJyb2xlIjoiQURNSU4iLCJleHAiOjE3NTMxNTc3NTZ9.JxBIjhSSYIee8H4wGzbFbqnZNtjaGn_BSZQh-LnA4Mk
          },
        },
      )

      return response.data
    } catch (err) {
      console.log('Erro no updateStock:', err.response?.data || err.message)
      return null
    }
  }

  async function updateImg(imageFile) { //Atualiza a imagem do produto
    try {
      const formData = new FormData()
      formData.append('image', imageFile)

      const response = await api.put(`/products/${idProductSelected.value}/image`, formData, {
        headers: {
          accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userStore.userMe.token}`,
        },
      })

      return response.data
    } catch (err) {
      console.log('Erro no updateImg:', err.response?.data || err.message)
      return null
    }
  }

  async function getAllProducts() {  // Busca todos os produtos
    try {
      const res = await api.get(`/products/user/144`, {
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userStore.userMe.token}`,
        },
      })

      // Adiciona descontos caso necessário
      const hoverProducts = res.data.map((product) => {
        const price = Number(product.price) || 0
        const discountsArray = Array.isArray(product.discounts) ? product.discounts : []
        const lastDiscount = discountsArray.at(-1) // Pega o último desconto (mesmo com array vazia)

        const discountPercentage = lastDiscount?.discount_percentage || 0

        const initialPrice =
          discountPercentage > 0
            ? (price / (1 - discountPercentage / 100)).toFixed(2)
            : price.toFixed(2)

        return {
          ...product,
          hover: false,
          loading: false,
          initial_price: initialPrice,
        }
      })

      // Ordena por nome (ordem alfabética, insensível a acentos e maiúsculas)
      const sortedProducts = hoverProducts.sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }),
      )

      products.value = sortedProducts

      // Se a rota for a landing page, aplica os filtros
      if (route.path === '/') {
        applyFilters()
      }

      return products.value
    } catch (err) {
      console.log('Erro no getAllProducts:', err.response?.data || err.message)
      return null
    }
  }

  async function getCategoryProducts() {  // Busco as categorias do produto
    try {
      const res = await api.get(`/products/category/${idSelected.value}`, {
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userStore.userMe.token}`,
        },
      })

      products.value = res.data
      return res.data
    } catch (err) {
      console.log('Erro no getCategoryProducts:', err.response?.data || err.message)
      return null
    }
  }

  async function deleteProduct(id) {  // Deleta um produto
    try {
      const res = await api.delete(`/products/${id}`, {
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${userStore.userMe.token}`,
        },
      })

      return res.data
    } catch (err) {
      console.log('Erro no deleteProduct:', err.response?.data || err.message)
      return null
    }
  }

  //Funçao que filtra os produtos por categoria (podendo ter vários filtros ativos)
  function applyFilters() {
    const selectedCategories = categories.value.filter((c) => c.selected).map((c) => c.id) // Vejo as categorias que eu tenho selecionado

    if (selectedCategories.length === 0) {
      // Nenhum filtro marcado → mostra tudo
      filtered.value = products.value
    } else {
      // Filtros marcados → filtra produtos por categoria
      filtered.value = products.value.filter(
        (product) => selectedCategories.includes(product.category_id), // ou category_id
      )
    }

    // Ordena os produtos por ordem alfabética
    landingStore.landingProducts = [...filtered.value].sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }),
    )
  }

  // Retornando
  return {
    deleteProduct,
    createModerator,
    createCategory,
    getCategories,
    deleteCategory,
    createProduct,
    getAllProducts,
    getCategoryProducts,
    updateProduct,
    updateStock,
    updateImg,
    editProduct,
    showCategories,
    showProducts,
    idSelected,
    products,
    loadingProducts,
    idProductSelected,
    categories,
  }
})
