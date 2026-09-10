import api from './api'

export type EstadoSesion = 'activa' | 'finalizada' | 'anulada'

export interface AnfitrionSesion {
  _id: string
  nombre: string
}

export interface Sesion {
  _id: string
  titulo: string
  // El listado (/sesiones) devuelve el anfitrión con nombre incluido; el resto
  // de endpoints (crear, actualizar, obtener por id) solo devuelven el id.
  anfitrionId: string | AnfitrionSesion
  estado: EstadoSesion
  inicioEn?: string
  finEn?: string
  creadoEn: string
}

export function idDelAnfitrion(sesion: Sesion): string {
  return typeof sesion.anfitrionId === 'string' ? sesion.anfitrionId : sesion.anfitrionId._id
}

export function nombreDelAnfitrion(sesion: Sesion): string | undefined {
  return typeof sesion.anfitrionId === 'string' ? undefined : sesion.anfitrionId.nombre
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

  async obtenerSesion(id: string): Promise<Sesion> {
    const { data } = await api.get<Sesion>(`/sesiones/${id}`)
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
