import { sesionRepositorio } from './sesion.repositorio';
import { ISesion } from './sesion.modelo';

export const sesionServicio = {
    listarSesiones: () => sesionRepositorio.listar(),
    obtenerSesionPorId: (id: string) => sesionRepositorio.obtenerPorId(id),
    crearSesion: (datos: Partial<ISesion>) => sesionRepositorio.crear(datos),
    actualizarSesion: (id: string, datos: Partial<ISesion>) => sesionRepositorio.actualizar(id, datos),
    anularSesion: (id: string) => sesionRepositorio.anular(id),
};
