import api from './api'

export type EstadoSesion = 'activa' | 'finalizada' | 'anulada'

export interface Sesion {
  _id: string
  titulo: string
  anfitrionId: string
  estado: EstadoSesion
  inicioEn?: string
  finEn?: string
  creadoEn: string
}

export interface DatosNuevaSesion {
  titulo: string
  anfitrionId: string
  inicioEn: string
  finEn?: string
}

export interface DatosActualizarSesion {
  titulo: string
  inicioEn: string
  finEn?: string
}

export const sesionServicio = {
  async listarSesiones(): Promise<Sesion[]> {
    const { data } = await api.get<Sesion[]>('/sesiones')
    return data
  },

  async programarSesion(datos: DatosNuevaSesion): Promise<Sesion> {
    const { data } = await api.post<Sesion>('/sesiones', datos)
    return data
  },

  async actualizarSesion(id: string, datos: DatosActualizarSesion): Promise<Sesion> {
    const { data } = await api.put<Sesion>(`/sesiones/${id}`, datos)
    return data
  },

  async anularSesion(id: string): Promise<Sesion> {
    const { data } = await api.patch<Sesion>(`/sesiones/${id}/anular`)
    return data
  },
}
