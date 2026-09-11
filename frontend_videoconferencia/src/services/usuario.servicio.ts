import api from './api'

export interface Usuario {
  _id: string
  nombre: string
  correo: string
  activo: boolean
  creadoEn: string
}

export interface DatosNuevoUsuario {
  nombre: string
  correo: string
  contrasena: string
}

export interface DatosActualizarUsuario {
  nombre: string
  correo: string
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

  actualizarUsuario: async (id: string, datos: DatosActualizarUsuario): Promise<Usuario> => {
    const respuesta = await api.put<Usuario>(`/usuarios/${id}`, datos)
    return respuesta.data
  },

  cambiarEstadoUsuario: async (id: string, activo: boolean): Promise<Usuario> => {
    const respuesta = await api.patch<Usuario>(`/usuarios/${id}/estado`, { activo })
    return respuesta.data
  },

  cambiarContrasenaUsuario: async (id: string, contrasena: string): Promise<Usuario> => {
    const respuesta = await api.patch<Usuario>(`/usuarios/${id}/contrasena`, { contrasena })
    return respuesta.data
  },
}
