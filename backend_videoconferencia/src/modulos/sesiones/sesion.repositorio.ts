import { Sesion, ISesion } from './sesion.modelo';

export const sesionRepositorio = {
    listar: () => Sesion.find().populate('anfitrionId', 'nombre'),
    obtenerPorId: (id: string) => Sesion.findById(id),
    crear: (datos: Partial<ISesion>) => Sesion.create(datos),
    actualizar: (id: string, datos: Partial<ISesion>) => Sesion.findByIdAndUpdate(id, datos, { new: true }),
    anular: (id: string) => Sesion.findByIdAndUpdate(id, { estado: 'anulada' }, { new: true }),

    listarRecientes: (limite: number) => Sesion.find().sort({ creadoEn: -1 }).limit(limite),

    buscarPorTexto: (texto: string, limite: number) =>
        Sesion.aggregate([
            { $addFields: { idTexto: { $toString: '$_id' } } },
            { $match: { idTexto: { $regex: texto, $options: 'i' } } },
            { $sort: { creadoEn: -1 } },
            { $limit: limite },
        ]),
};
