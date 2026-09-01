import type { Usuario } from './autenticacion.servicio'

const CLAVE_USUARIO = 'usuario'

export function guardarUsuario(usuario: Usuario): void {
  localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario))
}

export function obtenerUsuario(): Usuario | null {
  const datos = localStorage.getItem(CLAVE_USUARIO)
  return datos ? (JSON.parse(datos) as Usuario) : null
}

export function eliminarUsuario(): void {
  localStorage.removeItem(CLAVE_USUARIO)
}
