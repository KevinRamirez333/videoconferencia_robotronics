import { Router } from 'express';
import { listarSesiones, crearSesion, actualizarSesion, anularSesion } from './sesion.controlador';

const router = Router();

router.get('/', listarSesiones);
router.post('/', crearSesion);
router.put('/:id', actualizarSesion);
router.patch('/:id/anular', anularSesion);

export default router;
