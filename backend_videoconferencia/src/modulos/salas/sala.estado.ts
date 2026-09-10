export interface IParticipanteConectado {
    socketId: string;
    usuarioId: string;
    nombre: string;
}

interface IEstadoSala {
    anfitrionSocketId: string | null;
    admitidos: Map<string, IParticipanteConectado>;
    enEspera: Map<string, IParticipanteConectado>;
}

const salas = new Map<string, IEstadoSala>();

function obtenerOCrearSala(sesionId: string): IEstadoSala {
    let sala = salas.get(sesionId);

    if (!sala) {
        sala = { anfitrionSocketId: null, admitidos: new Map(), enEspera: new Map() };
        salas.set(sesionId, sala);
    }

    return sala;
}

export const salaEstado = {
    ponerEnEspera(sesionId: string, participante: IParticipanteConectado): void {
        obtenerOCrearSala(sesionId).enEspera.set(participante.socketId, participante);
    },

    quitarDeEspera(sesionId: string, socketId: string): IParticipanteConectado | undefined {
        const sala = salas.get(sesionId);
        const participante = sala?.enEspera.get(socketId);
        sala?.enEspera.delete(socketId);
        return participante;
    },

    admitir(sesionId: string, participante: IParticipanteConectado, esAnfitrion: boolean): void {
        const sala = obtenerOCrearSala(sesionId);
        sala.admitidos.set(participante.socketId, participante);

        if (esAnfitrion) {
            sala.anfitrionSocketId = participante.socketId;
        }
    },

    esAnfitrion(sesionId: string, socketId: string): boolean {
        return salas.get(sesionId)?.anfitrionSocketId === socketId;
    },

    obtenerAdmitidos(sesionId: string, excluirSocketId?: string): IParticipanteConectado[] {
        const sala = salas.get(sesionId);

        if (!sala) {
            return [];
        }

        return [...sala.admitidos.values()].filter((p) => p.socketId !== excluirSocketId);
    },

    obtenerEnEspera(sesionId: string): IParticipanteConectado[] {
        return [...(salas.get(sesionId)?.enEspera.values() ?? [])];
    },

    obtenerParticipante(sesionId: string, socketId: string): IParticipanteConectado | undefined {
        return salas.get(sesionId)?.admitidos.get(socketId);
    },

    quitarParticipante(sesionId: string, socketId: string): void {
        const sala = salas.get(sesionId);

        if (!sala) {
            return;
        }

        sala.admitidos.delete(socketId);
        sala.enEspera.delete(socketId);

        if (sala.anfitrionSocketId === socketId) {
            sala.anfitrionSocketId = null;
        }

        if (sala.admitidos.size === 0 && sala.enEspera.size === 0) {
            salas.delete(sesionId);
        }
    },

    buscarSesionYParticipantePorSocket(socketId: string): { sesionId: string; participante: IParticipanteConectado } | undefined {
        for (const [sesionId, sala] of salas) {
            const participante = sala.admitidos.get(socketId) ?? sala.enEspera.get(socketId);

            if (participante) {
                return { sesionId, participante };
            }
        }

        return undefined;
    },
};
