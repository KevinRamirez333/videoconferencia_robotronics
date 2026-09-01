import { Router } from 'express';
import { listarParticipantes, crearParticipante } from './participante.controlador';

const router = Router();

router.get('/', listarParticipantes);
router.post('/', crearParticipante);

export default router;
