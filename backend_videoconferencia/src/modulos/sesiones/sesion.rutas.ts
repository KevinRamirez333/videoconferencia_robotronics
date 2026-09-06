import { Router } from 'express';
import { listarSesiones, crearSesion, actualizarSesion } from './sesion.controlador';

const router = Router();

router.get('/', listarSesiones);
router.post('/', crearSesion);
router.put('/:id', actualizarSesion);

export default router;
