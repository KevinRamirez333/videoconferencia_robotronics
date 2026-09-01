

<script>
const crearUsuario = async () => {
  error.value = '';
  loading.value = true;

  try {
    const response = await api.post('/usuarios', {
      nombre_usuario: nombre_usuario.value,
      password: password.value,
    });
 } catch (err) {
    error.value = 'Usuario o contraseña incorrectos.';
};
}
</script>

<template>


</template>