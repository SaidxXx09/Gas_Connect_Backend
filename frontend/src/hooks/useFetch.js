import api from '../api/axios'
import { useState } from 'react'
import { toast } from 'react-toastify'

export function useFetch() {

    const [loading, setLoading] = useState(false)

    const fetchDataBackend = async (url, data = null, method = 'GET', headers = {}) => {

        const loadingToast = toast.loading('Procesando solicitud...')
        setLoading(true)
        try {
            const response = await api({
                method,
                url,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                },
                data,
            })

            toast.dismiss(loadingToast)
            toast.success(response?.data?.mensaje || response?.data?.msg || 'Operación exitosa')
            return response?.data

        } catch (error) {
            toast.dismiss(loadingToast)
            toast.error(error.response?.data?.mensaje || error.response?.data?.msg || 'Ocurrió un error inesperado')
            console.error(error)
        }
        finally {
            setLoading(false)
        }
    }

    return {fetchDataBackend,loading }
}
