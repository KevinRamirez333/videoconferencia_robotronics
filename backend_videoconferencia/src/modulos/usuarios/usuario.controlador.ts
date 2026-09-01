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
