import { Sesion, ISesion } from './sesion.modelo';

export const sesionRepositorio = {
    listar: () => Sesion.find().populate('anfitrionId', 'nombre'),
    obtenerPorId: (id: string) => Sesion.findById(id),
    crear: (datos: Partial<ISesion>) => Sesion.create(datos),
    actualizar: (id: string, datos: Partial<ISesion>) => Sesion.findByIdAndUpdate(id, datos, { new: true }),
    anular: (id: string) => Sesion.findByIdAndUpdate(id, { estado: 'anulada' }, { new: true }),
};
