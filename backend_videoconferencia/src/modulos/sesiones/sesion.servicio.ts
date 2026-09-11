import { sesionRepositorio } from './sesion.repositorio';
import { ISesion } from './sesion.modelo';

export const sesionServicio = {
    listarSesiones: () => sesionRepositorio.listar(),
    crearSesion: (datos: Partial<ISesion>) => sesionRepositorio.crear(datos),
    listarSesionesRecientes: (limite = 5) => sesionRepositorio.listarRecientes(limite),
    buscarSesiones: (texto: string, limite = 20) => sesionRepositorio.buscarPorTexto(texto, limite),
};
