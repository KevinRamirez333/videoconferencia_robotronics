import { Schema, model, Document, Types } from 'mongoose';

export interface IParticipante extends Document {
    sesionId: Types.ObjectId;
    usuarioId: Types.ObjectId;
    seUnioEn: Date;
    salioEn?: Date;
}

const participanteEsquema = new Schema<IParticipante>({
    sesionId: { type: Schema.Types.ObjectId, ref: 'Sesion', required: true },
    usuarioId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    seUnioEn: { type: Date, default: Date.now },
    salioEn: { type: Date },
});

export const Participante = model<IParticipante>('Participante', participanteEsquema);
