import { Router } from 'express';
import { listarSesiones, crearSesion, listarSesionesRecientes, buscarSesiones } from './sesion.controlador';

const router = Router();

router.get('/recientes', listarSesionesRecientes);
router.get('/buscar', buscarSesiones);
router.get('/', listarSesiones);
router.post('/', crearSesion);

export default router;
