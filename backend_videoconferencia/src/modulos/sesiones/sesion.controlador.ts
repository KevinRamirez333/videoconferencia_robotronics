import { Request, Response } from 'express';
import { sesionServicio } from './sesion.servicio';

export const listarSesiones = async (_req: Request, res: Response): Promise<void> => {
    const sesiones = await sesionServicio.listarSesiones();
    res.json(sesiones);
};

export const crearSesion = async (req: Request, res: Response): Promise<void> => {
    const sesion = await sesionServicio.crearSesion(req.body);
    res.status(201).json(sesion);
};

export const actualizarSesion = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (typeof id !== 'string') {
        res.status(400).json({ mensaje: 'El id de la sesión es obligatorio' });
        return;
    }

    const sesion = await sesionServicio.actualizarSesion(id, req.body);

    if (!sesion) {
        res.status(404).json({ mensaje: 'Sesión no encontrada' });
        return;
    }

    res.json(sesion);
};

export const anularSesion = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (typeof id !== 'string') {
        res.status(400).json({ mensaje: 'El id de la sesión es obligatorio' });
        return;
    }

    const sesion = await sesionServicio.anularSesion(id);

    if (!sesion) {
        res.status(404).json({ mensaje: 'Sesión no encontrada' });
        return;
    }

    res.json(sesion);
};
