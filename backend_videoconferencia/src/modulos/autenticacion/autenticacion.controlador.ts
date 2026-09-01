import { Request, Response } from 'express';
import { autenticacionServicio } from './autenticacion.servicio';

export const iniciarSesion = async (req: Request, res: Response): Promise<void> => {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
        res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });
        return;
    }

    const usuario = await autenticacionServicio.iniciarSesion(correo, contrasena);

    if (!usuario) {
        res.status(401).json({ mensaje: 'Credenciales inválidas' });
        return;
    }

    res.json(usuario);
};
