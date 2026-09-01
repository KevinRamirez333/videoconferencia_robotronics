import { Router } from 'express';
import usuarioRutas from '../modulos/usuarios/usuario.rutas';
import sesionRutas from '../modulos/sesiones/sesion.rutas';
import participanteRutas from '../modulos/participantes/participante.rutas';
import autenticacionRutas from '../modulos/autenticacion/autenticacion.rutas';

const router = Router();

router.use('/usuarios', usuarioRutas);
router.use('/sesiones', sesionRutas);
router.use('/participantes', participanteRutas);
router.use('/autenticacion', autenticacionRutas);
router.use('/login', autenticacionRutas);
export default router;
