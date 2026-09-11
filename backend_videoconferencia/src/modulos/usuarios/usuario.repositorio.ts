import { Usuario, IUsuario } from './usuario.modelo';

export const usuarioRepositorio = {
    listar: () => Usuario.find(),
    buscarPorId: (id: string) => Usuario.findById(id),
    crear: (datos: Partial<IUsuario>) => Usuario.create(datos),
    buscarPorCorreoConContrasena: (correo: string) => Usuario.findOne({ correo }).select('+contrasena'),

    actualizar: async (id: string, datos: Partial<IUsuario>) => {
        const usuario = await Usuario.findById(id);
        if (!usuario) {
            return null;
        }

        if (datos.nombre !== undefined) {
            usuario.nombre = datos.nombre;
        }
        if (datos.correo !== undefined) {
            usuario.correo = datos.correo;
        }
        if (datos.contrasena) {
            usuario.contrasena = datos.contrasena;
        }

        return usuario.save();
    },

    cambiarEstado: (id: string, activo: boolean) =>
        Usuario.findByIdAndUpdate(id, { activo }, { new: true }),
};
