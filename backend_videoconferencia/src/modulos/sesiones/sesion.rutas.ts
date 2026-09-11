import { Router } from 'express';
<<<<<<< HEAD
import { listarSesiones, obtenerSesion, crearSesion, actualizarSesion, anularSesion } from './sesion.controlador';
=======
import { listarSesiones, crearSesion, listarSesionesRecientes, buscarSesiones } from './sesion.controlador';
>>>>>>> origin/feature/UsuariosParticipantes

const router = Router();

router.get('/recientes', listarSesionesRecientes);
router.get('/buscar', buscarSesiones);
router.get('/', listarSesiones);
router.get('/:id', obtenerSesion);
router.post('/', crearSesion);
router.put('/:id', actualizarSesion);
router.patch('/:id/anular', anularSesion);

export default router;
