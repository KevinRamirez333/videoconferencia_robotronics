import { Server as ServidorHttp } from 'http';
import { Server as ServidorHttps } from 'https';
import { Server } from 'socket.io';
import { registrarEventosSala } from '../modulos/salas/sala.socket';

export function configurarSocket(servidor: ServidorHttp | ServidorHttps): Server {
    const io = new Server(servidor, {
        cors: { origin: '*' },
    });

    registrarEventosSala(io);

    return io;
}
