import { Router } from 'express';
import { listarUsuarios, crearUsuario } from './usuario.controlador';

const router = Router();

router.get('/', listarUsuarios);
router.post('/', crearUsuario);

export default router;
