import { Sesion, ISesion } from './sesion.modelo';

export const sesionRepositorio = {
    listar: () => Sesion.find(),
    crear: (datos: Partial<ISesion>) => Sesion.create(datos),
};
