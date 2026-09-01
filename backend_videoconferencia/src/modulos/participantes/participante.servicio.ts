import { participanteRepositorio } from './participante.repositorio';
import { IParticipante } from './participante.modelo';

export const participanteServicio = {
    listarParticipantes: () => participanteRepositorio.listar(),
    crearParticipante: (datos: Partial<IParticipante>) => participanteRepositorio.crear(datos),
};
