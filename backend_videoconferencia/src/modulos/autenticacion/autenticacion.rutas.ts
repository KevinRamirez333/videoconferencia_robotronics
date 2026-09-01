import { Router } from 'express';
import { iniciarSesion } from './autenticacion.controlador';

const router = Router();

router.post('/', iniciarSesion);

export default router;
