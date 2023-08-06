'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('entities', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			entity_type_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			value: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			label: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			status: {
				type: Sequelize.STRING,
				allowNull: false,
				defaultValue: 'active',
			},
			type: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			created_by: {
				type: Sequelize.INTEGER,
			},
			updated_by: {
				type: Sequelize.INTEGER,
			},
			created_at: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updated_at: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			deleted_at: {
				type: Sequelize.DATE,
			},
		})

		await queryInterface.addIndex('entities', ['value', 'entity_type_id'], {
			unique: true,
			name: 'unique_entities_value',
			where: {
				deleted_at: null,
			},
		})
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('entities')
	},
}
