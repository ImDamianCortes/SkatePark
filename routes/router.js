const express = require('express');
const { append } = require('express/lib/response');
const router = express.Router();
const jwt = require('jsonwebtoken');

const { nuevoSkater, getSkaters, setSkaterStatus, getSkater, updateSkater } = require('../db/consulta_skatepark');
const send = require('../controllers/correo');

// -------------------------------------------------
// Endpoints
// -------------------------------------------------

// skatepark home
router.get('/skatepark', async(req, res) => {
    try {
        // consulta a la base de datos
        const skaters = await getSkaters();
        // renderiza la vista
        res.render('Home', {
            skaters
        });
    } catch (e) {
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500
        });
    }
})
// skatepark login get
router.get('/skatepark/login', (req, res) => {
    res.render('Login');
})
// skatepark login post
router.post("/skatepark/login", async (req, res) => {
    const { email, password } = req.body;
    const skater = await getSkater(email, password);
    if (skater) {
        if (skater.estado) {
            const token = jwt.sign(
                {
                    exp: Math.floor(Date.now() / 1000) + 30,
                    data: skater,
                },
                process.env.SECRET_KEY
            );
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
        const { email, nombre, anos_experiencia, especialidad,  } = data;
        console.log(data)
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


router.get('/skatepark/register', (req, res) => {
    res.render('Register');
})

router.post('/skatepark/register', async (req, res) => {
    //campura de elementos del formulario
    const { email, nombre, password, password__confirmation, experiencia, especialidad } = req.body;
    //mostrando en la consola
    console.log(email, nombre, password, password__confirmation, experiencia, especialidad);
    //comparando las contraseñas
    if (password !== password__confirmation) {
        res.render('Register', { error: 'Las contraseñas no coinciden' });
        return;
    }
    //confirmando que la peticion cuente con una foto
    if (req.files === null) {
        res.render('Register', { error: 'No se ha seleccionado una foto' });
        return;
    }
    //estableciendo el nombre de la foto
    const {foto} = req.files;
    const fotoName = `${foto.md5}-${foto.name}`;
    //preparando payload
    const payload = [ email, nombre, password, experiencia, especialidad, fotoName ];
    //guardando el usuario en la base de datos
    try {
        await nuevoSkater(payload);
        await foto.mv(`./public/img/skatepark/${fotoName}`);
        res.redirect('/skatepark');
    } catch (e) {
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500
        });
    }
})

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

router.put('/skatepark/skaters', async (req, res) => {
    const { id, estado } = req.body;
    console.log(id, estado);
    try {
        const skater = await setSkaterStatus(id, estado);
        res.render ('Admin', {
            skater
        });
    } catch (e) {
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500
        });
    }
})

router.post('/skatepark/skater', async(req, res) => {
    const { email, nombre, password, password__confirmed, anos_experiencia, especialidad } = req.body;
    console.log(email, nombre, password, password__confirmed, anos_experiencia, especialidad);


    /*
    if (password !== password__confirmed) {
        res.render('Login', { error: 'Las contraseñas no coinciden' });
        return;
    }
    */
    const consulta = [
        req.body.nombre,
        req.body.password,
        req.body.anos_experiencia,
        req.body.especialidad,
    ]
    const result = await updateSkater(req.body.email, consulta);
    res.redirect('/skatepark/login', {
        result
    });
})


router.get('/skatepark/home', (req, res) => {S
    res.render('Datos');
})

module.exports = router;