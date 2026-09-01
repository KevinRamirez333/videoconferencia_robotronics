import 'dotenv/config';
import app from './app';
import { conectarDB } from './config/db';

const PORT = process.env.PORT || 3000;

const iniciarServidor = async (): Promise<void> => {
    await conectarDB();

    app.listen(PORT, () => {
        console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
};

iniciarServidor();