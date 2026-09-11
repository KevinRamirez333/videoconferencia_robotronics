import { Router } from 'express';
import {
    listarUsuarios,
    crearUsuario,
    actualizarUsuario,
    cambiarEstadoUsuario,
    cambiarContrasenaUsuario,
} from './usuario.controlador';

const router = Router();

router.get('/', listarUsuarios);
router.post('/', crearUsuario);
router.put('/:id', actualizarUsuario);
router.patch('/:id/estado', cambiarEstadoUsuario);
router.patch('/:id/contrasena', cambiarContrasenaUsuario);

export default router;
