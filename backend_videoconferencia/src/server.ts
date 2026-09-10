import 'dotenv/config';
import http from 'http';
import https from 'https';
import app from './app';
import { conectarDB } from './config/db';
import { configurarSocket } from './config/socket';
import { obtenerCertificadoDesarrollo } from './config/certificadoDesarrollo';

const PORT = process.env.PORT || 3000;
const usarHttps = process.env.HTTPS === 'true';

const iniciarServidor = async (): Promise<void> => {
    await conectarDB();

    const servidor = usarHttps ? https.createServer(await obtenerCertificadoDesarrollo(), app) : http.createServer(app);

    configurarSocket(servidor);

    servidor.listen(PORT, () => {
        const protocolo = usarHttps ? 'https' : 'http';
        console.log(`Servidor ejecutándose en ${protocolo}://localhost:${PORT}`);
    });
};

iniciarServidor();