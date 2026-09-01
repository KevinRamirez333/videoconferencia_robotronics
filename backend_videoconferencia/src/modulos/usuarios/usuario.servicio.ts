import { usuarioRepositorio } from './usuario.repositorio';
import { IUsuario } from './usuario.modelo';

export const usuarioServicio = {
    listarUsuarios: () => usuarioRepositorio.listar(),
    crearUsuario: (datos: Partial<IUsuario>) => usuarioRepositorio.crear(datos),
};
