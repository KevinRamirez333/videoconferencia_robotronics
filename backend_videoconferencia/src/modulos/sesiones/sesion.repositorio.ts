import { Sesion, ISesion } from './sesion.modelo';

export const sesionRepositorio = {
    listar: () => Sesion.find(),
    crear: (datos: Partial<ISesion>) => Sesion.create(datos),
    actualizar: (id: string, datos: Partial<ISesion>) => Sesion.findByIdAndUpdate(id, datos, { new: true }),
};
