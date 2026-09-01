import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUsuario extends Document {
    nombre: string;
    correo: string;
    contrasena: string;
    creadoEn: Date;
    compararContrasena(contrasenaIngresada: string): Promise<boolean>;
}

const usuarioEsquema = new Schema<IUsuario>({
    nombre: { type: String, required: true, trim: true },
    correo: { type: String, required: true, unique: true, trim: true, lowercase: true },
    contrasena: { type: String, required: true, select: false },
}, {
    timestamps: { createdAt: 'creadoEn', updatedAt: false },
    toJSON: {
        transform: (_doc, ret: Record<string, unknown>) => {
            delete ret['contrasena'];
            delete ret['__v'];
            return ret;
        },
    },
});

usuarioEsquema.pre('save', async function () {
    if (!this.isModified('contrasena')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.contrasena = await bcrypt.hash(this.contrasena, salt);
});

usuarioEsquema.methods.compararContrasena = function (contrasenaIngresada: string): Promise<boolean> {
    return bcrypt.compare(contrasenaIngresada, this.contrasena);
};

export const Usuario = model<IUsuario>('Usuario', usuarioEsquema);
