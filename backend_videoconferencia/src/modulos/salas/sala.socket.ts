import { Server, Socket } from 'socket.io';
import { Types } from 'mongoose';
import { salaEstado, IParticipanteConectado } from './sala.estado';
import { sesionServicio } from '../sesiones/sesion.servicio';
import { participanteServicio } from '../participantes/participante.servicio';

interface IUsuarioSocket {
    _id: string;
    nombre: string;
}

function nombreSala(sesionId: string): string {
    return `sala:${sesionId}`;
}

async function manejarUnirse(io: Server, socket: Socket, sesionId: string, usuario: IUsuarioSocket): Promise<void> {
    const sesion = await sesionServicio.obtenerSesionPorId(sesionId);

    if (!sesion || sesion.estado !== 'activa') {
        socket.emit('sala:error', { mensaje: 'La sesión no existe o no está activa' });
        return;
    }

    socket.data.sesionId = sesionId;
    socket.data.usuarioId = usuario._id;
    socket.data.nombre = usuario.nombre;

    const participante: IParticipanteConectado = { socketId: socket.id, usuarioId: usuario._id, nombre: usuario.nombre };
    const esAnfitrion = sesion.anfitrionId.toString() === usuario._id;

    if (esAnfitrion) {
        await admitirParticipante(socket, sesionId, participante, true);
        return;
    }

    salaEstado.ponerEnEspera(sesionId, participante);
    socket.emit('sala:esperando');

    const anfitrionSocketId = [...salaEstado.obtenerAdmitidos(sesionId)].find((p) => p.usuarioId === sesion.anfitrionId.toString())?.socketId;

    if (anfitrionSocketId) {
        io.to(anfitrionSocketId).emit('sala:solicitudIngreso', { socketId: socket.id, usuario: { _id: usuario._id, nombre: usuario.nombre } });
    }
}

async function admitirParticipante(
    socket: Socket,
    sesionId: string,
    participante: IParticipanteConectado,
    esAnfitrion: boolean,
): Promise<void> {
    const yaAdmitidos = salaEstado.obtenerAdmitidos(sesionId);
    salaEstado.admitir(sesionId, participante, esAnfitrion);
    socket.join(nombreSala(sesionId));

    socket.emit('sala:admitido', {
        participantes: yaAdmitidos.map((p) => ({ socketId: p.socketId, usuario: { _id: p.usuarioId, nombre: p.nombre } })),
    });

    socket.to(nombreSala(sesionId)).emit('sala:nuevoParticipante', {
        socketId: participante.socketId,
        usuario: { _id: participante.usuarioId, nombre: participante.nombre },
    });

    // Si quien se acaba de admitir es el anfitrión, hay que avisarle de las
    // personas que ya estaban esperando desde antes (por ejemplo, alguien intentó
    // entrar mientras el anfitrión todavía no se había conectado, o el anfitrión
    // se desconectó y vuelve a entrar). Sin esto, esas solicitudes quedaban
    // guardadas en el servidor pero nunca se le mostraban al anfitrión.
    if (esAnfitrion) {
        for (const enEspera of salaEstado.obtenerEnEspera(sesionId)) {
            socket.emit('sala:solicitudIngreso', {
                socketId: enEspera.socketId,
                usuario: { _id: enEspera.usuarioId, nombre: enEspera.nombre },
            });
        }
    }

    try {
        await participanteServicio.crearParticipante({
            sesionId: new Types.ObjectId(sesionId),
            usuarioId: new Types.ObjectId(participante.usuarioId),
        });
    } catch (error) {
        console.error('No se pudo registrar la asistencia del participante', error);
    }
}

function manejarAdmitir(io: Server, socket: Socket, sesionId: string, socketId: string): void {
    if (!salaEstado.esAnfitrion(sesionId, socket.id)) {
        return;
    }

    const participante = salaEstado.quitarDeEspera(sesionId, socketId);

    if (!participante) {
        return;
    }

    const socketParticipante = io.sockets.sockets.get(socketId);

    if (!socketParticipante) {
        return;
    }

    void admitirParticipante(socketParticipante, sesionId, participante, false);
}

function manejarRechazar(socket: Socket, io: Server, sesionId: string, socketId: string): void {
    if (!salaEstado.esAnfitrion(sesionId, socket.id)) {
        return;
    }

    salaEstado.quitarDeEspera(sesionId, socketId);
    io.to(socketId).emit('sala:rechazado');
}

async function manejarSalida(io: Server, socket: Socket): Promise<void> {
    const sesionId: string | undefined = socket.data.sesionId;
    const usuarioId: string | undefined = socket.data.usuarioId;

    if (!sesionId) {
        return;
    }

    const eraAnfitrion = salaEstado.esAnfitrion(sesionId, socket.id);
    salaEstado.quitarParticipante(sesionId, socket.id);
    socket.to(nombreSala(sesionId)).emit('sala:participanteSalio', { socketId: socket.id });

    if (eraAnfitrion) {
        for (const enEspera of salaEstado.obtenerEnEspera(sesionId)) {
            io.to(enEspera.socketId).emit('sala:error', { mensaje: 'El anfitrión salió de la sala' });
        }
    }

    if (usuarioId) {
        try {
            await participanteServicio.registrarSalida(sesionId, usuarioId);
        } catch (error) {
            console.error('No se pudo registrar la salida del participante', error);
        }
    }
}

function reenviarSenal(io: Server, socket: Socket, evento: string, datos: { destino: string; [clave: string]: unknown }): void {
    const { destino, ...resto } = datos;
    io.to(destino).emit(evento, { ...resto, origen: socket.id });
}

export function registrarEventosSala(io: Server): void {
    io.on('connection', (socket) => {
        socket.on('sala:unirse', ({ sesionId, usuario }: { sesionId: string; usuario: IUsuarioSocket }) => {
            void manejarUnirse(io, socket, sesionId, usuario);
        });

        socket.on('sala:admitir', ({ sesionId, socketId }: { sesionId: string; socketId: string }) => {
            manejarAdmitir(io, socket, sesionId, socketId);
        });

        socket.on('sala:rechazar', ({ sesionId, socketId }: { sesionId: string; socketId: string }) => {
            manejarRechazar(socket, io, sesionId, socketId);
        });

        socket.on('senal:oferta', (datos: { destino: string; oferta: unknown }) => reenviarSenal(io, socket, 'senal:oferta', datos));
        socket.on('senal:respuesta', (datos: { destino: string; respuesta: unknown }) => reenviarSenal(io, socket, 'senal:respuesta', datos));
        socket.on('senal:candidato', (datos: { destino: string; candidato: unknown }) => reenviarSenal(io, socket, 'senal:candidato', datos));

        socket.on('sala:salir', () => void manejarSalida(io, socket));
        socket.on('disconnect', () => void manejarSalida(io, socket));
    });
}
