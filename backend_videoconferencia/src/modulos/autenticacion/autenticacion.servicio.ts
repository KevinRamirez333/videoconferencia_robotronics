import { usuarioRepositorio } from '../usuarios/usuario.repositorio';
import { IUsuario } from '../usuarios/usuario.modelo';

export const autenticacionServicio = {
    iniciarSesion: async (correo: string, contrasena: string): Promise<IUsuario | null> => {
        const usuario = await usuarioRepositorio.buscarPorCorreoConContrasena(correo);

        if (!usuario) {
            return null;
        }

        const contrasenaValida = await usuario.compararContrasena(contrasena);

        if (!contrasenaValida) {
            return null;
        }

        return usuario;
    },
};
