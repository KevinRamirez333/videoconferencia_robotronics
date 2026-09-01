import { Request, Response } from 'express';
import { participanteServicio } from './participante.servicio';

export const listarParticipantes = async (_req: Request, res: Response): Promise<void> => {
    const participantes = await participanteServicio.listarParticipantes();
    res.json(participantes);
};

export const crearParticipante = async (req: Request, res: Response): Promise<void> => {
    const participante = await participanteServicio.crearParticipante(req.body);
    res.status(201).json(participante);
};
