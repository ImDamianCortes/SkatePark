const express = require('express');
const { append } = require('express/lib/response');
const router = express.Router();
const jwt = require('jsonwebtoken');
const chalk = require('chalk');

const { nuevoSkater, getSkaters, setSkaterStatus, getSkater, updateSkater, deleteSkater } = require('../db/consulta_skatepark');
const send = require('../controllers/correo');

// -------------------------------------------------
// Endpoints
// -------------------------------------------------

// disponibiliza la vista del proyecto
router.get('/skatepark', async (req, res) => {
    //se intenta obtenet la informacion del usuario
    try {
        // consulta a la base de datos
        const skaters = await getSkaters();
        // renderiza la vista Home con la informacion obtenida
        res.render('Home', {
            skaters
        });
    }
    // si hay un error se responde con un mensaje de error 
    catch (e) {
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500
        });
    }
})
// disponibiliza la vista register
router.get('/skatepark/register', (req, res) => {
    res.render('Register');
})
// disponibiliza la vista login
router.get('/skatepark/login', (req, res) => {
    res.render('Login');
})
// disponibiliza la vista administrador
router.get('/skatepark/admin', async (req, res) => {
    try {
        const skaters = await getSkaters();
        res.render('Admin', {
            skaters
        });
    } catch (e) {
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500
        });
    }
})

// disponibiliza la ruta /skatepark/register para registrar un skater
router.post('/skatepark/register', async (req, res) => {
    //captura de elementos del formulario a traves del cuerpo de la peticion
    const { email, nombre, password, password__confirmation, experiencia, especialidad } = req.body;
    //mostrando en la consola
    //console.log(email, nombre, password, password__confirmation, experiencia, especialidad);
    //comparando las contraseñas
    if (password !== password__confirmation) {
        //si no coinciden se renderiza la vista de registro con un mensaje de error
        //la data se agrega para que se muestre en el formulario
        res.render('Register', {
            error: 'Las contraseñas no coinciden',
            code: 400,
            data: req.body
        });
        return;
    }
    //confirmando que la peticion cuente con una foto
    if (req.files === null) {
        res.render('Register', { error: 'No se ha seleccionado una foto' });
        return;
    }
    //estableciendo el nombre de la foto
    const { foto } = req.files;
    const fotoName = `${foto.md5}-${foto.name}`;
    //preparando payload
    const payload = [email, nombre, password, experiencia, especialidad, fotoName];
    //guardando el usuario en la base de datos
    try {
        await nuevoSkater(payload);
        await foto.mv(`./public/img/skatepark/${fotoName}`);
        res.redirect('/skatepark');
    } catch (e) {
        // en caso de llave/email duplicada
        if (e.code === '23505') {
            res.render('Register', {
                error: 'El email ya esta registrado',
                code: 400,
                data: req.body
            });
        } else {
            res.status(500).send({
                error: `Algo salio mal... ${e}`,
                code: 500
            });
        }
    }
})

// skatepark login /skatepark/login para iniciar sesion
router.post("/skatepark/login", async (req, res) => {
    const { email, password } = req.body;
    const skater = await getSkater(email, password);
    if (skater) {
        if (skater.estado) {
            const token = jwt.sign(
                {
                    exp: Math.floor(Date.now() / 1000) + (60 * 5),
                    data: skater,
                },
                process.env.SECRET_KEY
            );
            //renderizando la vista datos con el token
            res.redirect(`/skatepark/datos?token=${token}`);
        } else {
            res.status(401).send({
                error: `Su cuenta aun se encuentra en revision por el administrador`,
                code: 401
            });
        }
    } else {
        res.status(404).send({
            error: `El nombre de usuario o contraseña son incorrectos`,
            code: 404
        });
    }
})

// skatepark login get
router.get("/skatepark/datos", async (req, res) => {
    const { token } = req.query
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        const { data } = decoded;
        const { email, nombre, anos_experiencia, especialidad } = data;
        console.log(chalk.yellow(data))
        err
            ? res.status(401).send(
                res.send({
                    error: `401 - No autorizado`,
                    message: "Usted no esta autorizado para ver esta pagina",
                    token_error: err.message,
                })
            )
            : res.render('Datos', {
                email,
                nombre,
                anos_experiencia,
                especialidad,
            });
    });
})

// disponibiliza la ruta /skatepark/skaters para actualizar el estado de un skater
router.put('/skatepark/skaters', async (req, res) => {
    const { id, estado } = req.body;
    console.log(id, estado);
    try {
        const skater = await setSkaterStatus(id, estado);
        res.render('Admin', {
            skater
        });
    } catch (e) {
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500
        });
    }
})

router.post('/skatepark/skater', async (req, res) => {
    const { email, nombre, password, password__confirmation, anos_experiencia, especialidad } = req.body;
    console.log(chalk.red(email, nombre, password, password__confirmation, anos_experiencia, especialidad));

    if (password !== password__confirmation) {
        res.render('Datos', { error: 'Las contraseñas no coinciden' });
        return;
    }
    
    const consulta = [
        req.body.nombre,
        req.body.password,
        req.body.anos_experiencia,
        req.body.especialidad,
    ]
    const {skater} = await updateSkater(req.body.email, consulta);
    res.render('Datos', {
        message: 'Datos actualizados exitosamente.',
        email,
        nombre,
        anos_experiencia,
        especialidad,
    });
})
// Disponibiliza ruta para eliminar usuarios
router.post('/skatepark/skater/delete', async (req, res) => {
    const { email } = req.body;
    console.log(chalk.red(email));
    const response = await deleteSkater(email);
    console.log(chalk.red(response));
    const skaters = await getSkaters();
    res.render('Home', {
        message: 'Usuario eliminado exitosamente.',
        skaters
    });

});


module.exports = router;