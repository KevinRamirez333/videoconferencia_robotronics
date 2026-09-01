import { sesionRepositorio } from './sesion.repositorio';
import { ISesion } from './sesion.modelo';

export const sesionServicio = {
    listarSesiones: () => sesionRepositorio.listar(),
    crearSesion: (datos: Partial<ISesion>) => sesionRepositorio.crear(datos),
};
