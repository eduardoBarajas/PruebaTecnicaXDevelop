const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(`postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PWD}@${process.env.POSTGRES_ADDR}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`);

module.exports = sequelize;