import create from 'zustand'
import api from '../api/axios'
import { toast } from 'react-toastify'

const storeProfile = create((set) => ({
    user: null,
    clearUser: () => set({ user: null }),
    profile: async () => {
        try {
            const respuesta = await api.get('/perfil')
            set({ user: respuesta.data })
        } catch (error) {
            console.error(error)
        }
    },

    updateProfile: async (data) => {
        try {
            const respuesta = await api.put('/perfil', data)
            set({ user: respuesta.data })
            toast.success('Perfil actualizado correctamente')
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.msg || 'Error al actualizar perfil')
        }
    },
    
    updatePasswordProfile: async (data) => {
        try {
            const respuesta = await api.put('/perfil/password', data)
            return respuesta
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.msg || 'Error al actualizar contraseña')
        }
    }

}))

export default storeProfile
