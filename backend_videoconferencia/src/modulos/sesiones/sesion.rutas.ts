import { Router } from 'express';
import { listarSesiones, crearSesion } from './sesion.controlador';

const router = Router();

router.get('/', listarSesiones);
router.post('/', crearSesion);

export default router;
