import { Usuario, IUsuario } from './usuario.modelo';

export const usuarioRepositorio = {
    listar: () => Usuario.find(),
    crear: (datos: Partial<IUsuario>) => Usuario.create(datos),
    buscarPorCorreoConContrasena: (correo: string) => Usuario.findOne({ correo }).select('+contrasena'),
};
