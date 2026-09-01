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
