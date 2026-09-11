import { Router } from 'express';
import { listarUsuarios, crearUsuario, actualizarUsuario, cambiarEstadoUsuario } from './usuario.controlador';

const router = Router();

router.get('/', listarUsuarios);
router.post('/', crearUsuario);
router.put('/:id', actualizarUsuario);
router.patch('/:id/estado', cambiarEstadoUsuario);

export default router;
