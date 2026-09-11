import { Request, Response } from 'express';
import { usuarioServicio } from './usuario.servicio';

export const listarUsuarios = async (_req: Request, res: Response): Promise<void> => {
    const usuarios = await usuarioServicio.listarUsuarios();
    res.json(usuarios);
};

export const crearUsuario = async (req: Request, res: Response): Promise<void> => {
    const usuario = await usuarioServicio.crearUsuario(req.body);
    res.status(201).json(usuario);
};

export const actualizarUsuario = async (req: Request, res: Response): Promise<void> => {
    const usuario = await usuarioServicio.actualizarUsuario(req.params.id as string, req.body);

    if (!usuario) {
        res.status(404).json({ mensaje: 'Usuario no encontrado' });
        return;
    }

    res.json(usuario);
};

export const cambiarEstadoUsuario = async (req: Request, res: Response): Promise<void> => {
    const { activo } = req.body;

    if (typeof activo !== 'boolean') {
        res.status(400).json({ mensaje: 'El campo "activo" es obligatorio y debe ser booleano' });
        return;
    }

    const usuario = await usuarioServicio.cambiarEstadoUsuario(req.params.id as string, activo);

    if (!usuario) {
        res.status(404).json({ mensaje: 'Usuario no encontrado' });
        return;
    }

    res.json(usuario);
};

export const cambiarContrasenaUsuario = async (req: Request, res: Response): Promise<void> => {
    const { contrasena } = req.body;

    if (typeof contrasena !== 'string' || contrasena.length < 6) {
        res.status(400).json({ mensaje: 'La contraseña es obligatoria y debe tener al menos 6 caracteres' });
        return;
    }

    const usuario = await usuarioServicio.cambiarContrasenaUsuario(req.params.id as string, contrasena);

    if (!usuario) {
        res.status(404).json({ mensaje: 'Usuario no encontrado' });
        return;
    }

    res.json(usuario);
};
