$('#login__ln').click(()=>{
  window.location.href = '/proyectos/la_nasa/login';
})

$('#register___skatepark').click(async (e) => {
  //previniendo evento por defecto
  e.preventDefault();
  //captura de datos del formulario
  const email = $('#sp__register__email').val();
  const nombre = $('#sp__register__nombre').val();
  const password = $('#sp__register__password').val();
  const password_confirmation = $('#sp__register__password_confirmation').val();
  const experiencia = $('#sp__register__experiencia').val();
  const especialidad = $('#sp__register__especialidad').val();

  //preparando payload
  const payload = { email, nombre, password };

  await axios.post('/proyectos/la_nasa/usuarios', payload);

  try {

    alert('Usuario registrado');
    //redireccionando a la ruta /login
    window.location.href = '/proyectos/la_nasa/login';

  } catch ({ response }) {
    console.log(response);
    console.log(response.data);
    const { data } = response;
    const { error } = data;
    alert(error);
  }

});


const changeStatus = async (id, e) => {
  const estado = e.checked;
  try {
    await axios.put(`/skatepark/skaters`, { id, estado });
    alert(estado ? 'Skater autorizado' : 'Skater desautorizado');
  } catch ({ response }) {
    console.log(response);
    console.log(response.data);
    const { data } = response;
    const { error } = data;
    alert(error);
  }
}

const verificacion = async () => {
  const email = $('#email').val();
  const password = $('#password').val();
  const payload = { email, password };
  try {
    const { data: token } = await axios.post('/skatepark', payload);
    alert('Usuario autenticado');
    window.location.href = '/proyectos/la_nasa/Evidencias?token=' + token;
  } catch ({ response }) {
    console.log(response);
    console.log(response.data);
    const { data } = response;
    const { error } = data;
    alert(error);
  }
}

const updateSkater = async (id, e) => {
  const nombre = e.value;
  console.log(nombre);
  console.log(id);
  /* 
  const estado = e.checked;
  try {
    await axios.put(`/skatepark/skaters`, { id, estado });
    alert(estado ? 'Skater autorizado' : 'Skater desautorizado');
  } catch ({ response }) {
    console.log(response);
    console.log(response.data);
    const { data } = response;
    const { error } = data;
    alert(error);
  }
  */
}