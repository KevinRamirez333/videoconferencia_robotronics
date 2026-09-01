import { Request, Response } from 'express';

export const noEncontrado = (req: Request, res: Response): void => {
    res.status(404).json({ mensaje: `Ruta no encontrada: ${req.originalUrl}` });
};
