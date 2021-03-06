var Sequelize = require('sequelize');

module.exports = require('../db.js').sequelize.define('gdg_participants',{
	"name": Sequelize.STRING,
	"surname":Sequelize.STRING,
	"nickname":Sequelize.STRING,
	"email":Sequelize.STRING,
	"phone":Sequelize.STRING,
	"gplus":Sequelize.STRING,
	"hometown":Sequelize.STRING,
	"company":Sequelize.STRING,
	"position":Sequelize.STRING,
	"www":Sequelize.STRING,
	"experience_level":Sequelize.STRING,
	"experience_desc":Sequelize.STRING,
	"interests":Sequelize.STRING,
	"events_visited":Sequelize.STRING,
	"english_knowledge":Sequelize.STRING,
	"t_shirt_size":Sequelize.STRING,
	"gender": Sequelize.STRING,
	"additional_info":Sequelize.STRING
});
