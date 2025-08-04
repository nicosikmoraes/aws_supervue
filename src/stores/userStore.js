import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useCartStore } from './cartStore'

export const useUserStore = defineStore(
  'user',
  () => {
    // Variáveis

    // Variáveis Arrays
    const userMe = reactive({
      name: '',
      email: '',
      id: '',
      imagem: '',
      role: '',
      token: '',
    })

    const admin = ref(false)
    const moderator = ref(false)
    const cartStore = useCartStore()
    const stockToken = ref('')

    //Caminho padrão da API
    const api = axios.create({
      baseURL: '/back',
    })

    // Funções

    //Função para criar usuário (REGISTER)
    async function createUser(user) { // Criar um novo usuário
      try {
        const res = await api.post(
          '/register',
          {
            name: user.name,
            email: user.email,
            password: user.password,
          },
          {
            headers: {
              accept: 'application/json',
              'Content-Type': 'application/json',
            },
          },
        )

        await login(user) // Já loga o usuário quando a conta é criada

        await cartStore.createCart() // Cria um carrinho

        return res.data
      } catch (err) {
        return null
      }
    }

    //Função para logar usuário (LOGIN)
    async function login(user) {
      try {
        const response = await api.post(
          '/login',
          {
            email: user.email,
            password: user.password,
          },
          {
            headers: {
              accept: 'application/json',
              'Content-Type': 'application/json',
            },
          },
        )

        userMe.token = response.data.token

        if (response.data.user.role === 'ADMIN') {
          admin.value = true
          moderator.value = true
        } else if (response.data.user.role === 'MODERATOR') {
          moderator.value = true
        } else {
          admin.value = false
          moderator.value = false
        }

        await getUserMe()
        return response.data
      } catch (error) {
        console.error('Erro no login:', error.response?.data || error.message)
        return null
      }
    }

    //Função para popular os dados com o do usuário logado
    function setUserMe(data) {
      userMe.name = data.name
      userMe.email = data.email
      userMe.id = data.id
      userMe.imagem = data.image_path
      userMe.role = data.role
    }

    //Função para remover os dados do usuário logado (EXIT)
    function quitUserMe() {
      userMe.name = ''
      userMe.email = ''
      userMe.id = ''
      userMe.imagem = ''
      userMe.role = ''
      userMe.token = ''
      admin.value = false
      cartStore.showPage = 0
      cartStore.cartItems = []
    }

    //Função para atualizar o usuário logado (UPDATE)
    async function updateUserMe(newName, newEmail) {
      try {
        // Valida que um dos dados não seja igual ao atual
        if (newName === userMe.name && newEmail === userMe.email) {
          throw new Error('Os dados não foram alterados')
        }

        const res = await api.put(
          '/users/me',
          {
            name: newName,
            email: newEmail,
          },
          {
            headers: {
              accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${userMe.token}`,
            },
          },
        )

        await getUserMe()
        return res.data
      } catch (err) {
        console.log('Erro no update:', err.response?.data || err.message)
        return null
      }
    }

    //Função para obter o usuário logado (GET)
    async function getUserMe() {
      try {
        const res = await api.get('/users/me', {
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userMe.token}`,
          },
        })

        setUserMe(res.data)
        return res.data
      } catch (err) {
        console.log('Erro no getUserMe:', err.response?.data || err.message)
        return null
      }
    }

    //Função para deletar o usuário logado (DELETE)
    async function deleteUserMe() {
      try {
        const res = await api.delete('/users/me', {
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userMe.token}`,
          },
        })

        quitUserMe()
        return res.data
      } catch (err) {
        console.log('Erro no deleteUserMe:', err.response?.data || err.message)
        return null
      }
    }

    //Função para atualizar a imagem do usuário logado
    async function uploadImagem(file) {
      try {
        const formData = new FormData()
        formData.append('image', file)

        const res = await api.put('/users/image', formData, {
          headers: {
            accept: 'application/json',
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${userMe.token}`,
          },
        })

        return res.data
      } catch (err) {
        console.log('Erro no uploadImagem:', err.response?.data || err.message)
        return null
      }
    }

    // Retornando
    return {
      createUser,
      login,
      setUserMe,
      quitUserMe,
      updateUserMe,
      getUserMe,
      deleteUserMe,
      uploadImagem,
      userMe,
      admin,
      moderator,
      stockToken,
    }
  },
  { persist: true },
)
