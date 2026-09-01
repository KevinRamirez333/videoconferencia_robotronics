import { Participante, IParticipante } from './participante.modelo';

export const participanteRepositorio = {
    listar: () => Participante.find(),
    crear: (datos: Partial<IParticipante>) => Participante.create(datos),
};
