const sequelize = require('../db/instance');
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    apellido: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    img_perfil: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    pass: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    // Other model options go here
});

module.exports = User;