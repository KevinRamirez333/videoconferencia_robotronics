import { Request, Response } from 'express';
import { sesionServicio } from './sesion.servicio';

// Evita que caracteres como ( ) . * se interpreten como regex al buscar por texto libre.
const escaparCaracteresEspeciales = (texto: string): string =>
    texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const listarSesiones = async (_req: Request, res: Response): Promise<void> => {
    const sesiones = await sesionServicio.listarSesiones();
    res.json(sesiones);
};

export const crearSesion = async (req: Request, res: Response): Promise<void> => {
    const sesion = await sesionServicio.crearSesion(req.body);
    res.status(201).json(sesion);
};

export const listarSesionesRecientes = async (req: Request, res: Response): Promise<void> => {
    const limite = Number(req.query.limite) || 5;
    const sesiones = await sesionServicio.listarSesionesRecientes(limite);
    res.json(sesiones);
};

export const buscarSesiones = async (req: Request, res: Response): Promise<void> => {
    const texto = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    if (!texto) {
        res.json([]);
        return;
    }

    const sesiones = await sesionServicio.buscarSesiones(escaparCaracteresEspeciales(texto));
    res.json(sesiones);
};
