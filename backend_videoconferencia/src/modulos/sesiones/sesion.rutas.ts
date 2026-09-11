import { Router } from 'express';
import {
    listarSesiones,
    obtenerSesion,
    crearSesion,
    actualizarSesion,
    anularSesion,
    listarSesionesRecientes,
    buscarSesiones,
} from './sesion.controlador';

const router = Router();

router.get('/recientes', listarSesionesRecientes);
router.get('/buscar', buscarSesiones);
router.get('/', listarSesiones);
router.get('/:id', obtenerSesion);
router.post('/', crearSesion);
router.put('/:id', actualizarSesion);
router.patch('/:id/anular', anularSesion);

export default router;
