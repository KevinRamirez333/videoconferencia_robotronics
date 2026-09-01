import express from 'express';
import cors from 'cors';
import rutas from './rutas';
import { noEncontrado } from './middlewares/noEncontrado';
import { manejadorErrores } from './middlewares/manejadorErrores';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
    res.json({
        status: 'ok',
        message: 'Backend funcionando correctamente'
    });
});

app.use('/', rutas);

app.use(noEncontrado);
app.use(manejadorErrores);

export default app;