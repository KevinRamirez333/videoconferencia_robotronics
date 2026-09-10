import api from './api'

export interface Usuario {
  _id: string
  nombre: string
  correo: string
  creadoEn: string
}

export interface DatosNuevoUsuario {
  nombre: string
  correo: string
  contrasena: string
}

export const usuarioServicio = {
  listarUsuarios: async (): Promise<Usuario[]> => {
    const respuesta = await api.get<Usuario[]>('/usuarios')
    return respuesta.data
  },

  crearUsuario: async (datos: DatosNuevoUsuario): Promise<Usuario> => {
    const respuesta = await api.post<Usuario>('/usuarios', datos)
    return respuesta.data
  },
}
