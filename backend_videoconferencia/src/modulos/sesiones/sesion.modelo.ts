import { Schema, model, Document, Types } from 'mongoose';

export type EstadoSesion = 'activa' | 'finalizada';

export interface ISesion extends Document {
    titulo: string;
    anfitrionId: Types.ObjectId;
    estado: EstadoSesion;
    inicioEn?: Date;
    finEn?: Date;
    creadoEn: Date;
}

const sesionEsquema = new Schema<ISesion>({
    titulo: { type: String, required: true, trim: true },
    anfitrionId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    estado: { type: String, enum: ['activa', 'finalizada'], default: 'activa' },
    inicioEn: { type: Date },
    finEn: { type: Date },
}, {
    timestamps: { createdAt: 'creadoEn', updatedAt: false },
});

export const Sesion = model<ISesion>('Sesion', sesionEsquema);
