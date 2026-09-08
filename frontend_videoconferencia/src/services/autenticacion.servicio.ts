import api from './api'

export interface Usuario {
  _id: string
  nombre: string
  correo: string
  creadoEn: string
}

export interface CredencialesInicioSesion {
  correo: string
  contrasena: string
}

export const autenticacionServicio = {
  async iniciarSesion(credenciales: CredencialesInicioSesion): Promise<Usuario> {
    const { data } = await api.post<Usuario>('/autenticacion', credenciales)
    return data
  },
}
