const sequelize = require('./instance');
const User = require('../models/user');

async function configDB() {
    // checamos si hay conexion
    try {
        await sequelize.authenticate();
        console.log('Se conecto a la bd con exito');
    } catch (err) {
        console.log('Ocurrio un problema al intentar conectarse a la bd: ' + err);
    }

    // Solo se ejecutaran las sincronizaciones de la bd si la bd termina con _xdevelop
    switch (process.env.ENV.toUpperCase()) {
        case 'DEV': {
            await User.sync({ alter: true, match: /_xdevelop$/ });
            console.log("Se alteraron las tablas de la base de datos!");
            break;
        }
        case 'TEST': {
            await User.sync({ force: true, match: /_xdevelop$/ });
            console.log("Se (re)crearon las tablas de la base de datos!");
            break;
        }
    }

}

module.exports = configDB;