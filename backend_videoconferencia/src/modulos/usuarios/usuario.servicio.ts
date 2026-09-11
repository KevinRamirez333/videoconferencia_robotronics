import { usuarioRepositorio } from './usuario.repositorio';
import { IUsuario } from './usuario.modelo';

export const usuarioServicio = {
    listarUsuarios: () => usuarioRepositorio.listar(),
    crearUsuario: (datos: Partial<IUsuario>) => usuarioRepositorio.crear(datos),
    actualizarUsuario: (id: string, datos: Partial<IUsuario>) => usuarioRepositorio.actualizar(id, datos),
    cambiarEstadoUsuario: (id: string, activo: boolean) => usuarioRepositorio.cambiarEstado(id, activo),
    cambiarContrasenaUsuario: (id: string, contrasena: string) => usuarioRepositorio.cambiarContrasena(id, contrasena),
};
