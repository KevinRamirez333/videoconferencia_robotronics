import { Sesion, ISesion } from './sesion.modelo';

export const sesionRepositorio = {
    listar: () => Sesion.find(),
    crear: (datos: Partial<ISesion>) => Sesion.create(datos),

    listarRecientes: (limite: number) => Sesion.find().sort({ creadoEn: -1 }).limit(limite),

    buscarPorTexto: (texto: string, limite: number) =>
        Sesion.aggregate([
            { $addFields: { idTexto: { $toString: '$_id' } } },
            { $match: { idTexto: { $regex: texto, $options: 'i' } } },
            { $sort: { creadoEn: -1 } },
            { $limit: limite },
        ]),
};
