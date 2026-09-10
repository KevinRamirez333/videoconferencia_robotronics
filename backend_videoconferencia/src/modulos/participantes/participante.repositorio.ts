import { Participante, IParticipante } from './participante.modelo';

export const participanteRepositorio = {
    listar: () => Participante.find(),
    crear: (datos: Partial<IParticipante>) => Participante.create(datos),
    registrarSalida: (sesionId: string, usuarioId: string) =>
        Participante.findOneAndUpdate(
            { sesionId, usuarioId, salioEn: { $exists: false } },
            { salioEn: new Date() },
            { sort: { seUnioEn: -1 } },
        ),
};
