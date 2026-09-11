import api from './api'

export interface Sesion {
  _id: string
  titulo: string
  anfitrionId: string
  estado: 'activa' | 'finalizada'
  inicioEn?: string
  finEn?: string
  creadoEn: string
}

export const sesionServicio = {
  listarRecientes: async (limite = 5): Promise<Sesion[]> => {
    const respuesta = await api.get<Sesion[]>('/sesiones/recientes', { params: { limite } })
    return respuesta.data
  },

  buscarPorTexto: async (texto: string): Promise<Sesion[]> => {
    const respuesta = await api.get<Sesion[]>('/sesiones/buscar', { params: { q: texto } })
    return respuesta.data
  },
}
