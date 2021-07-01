'use strict';

let comments = []

for (let i = 0; i < 10; i++) {
  comments.push({
    text: `test${i}`,
    UserId: 1,
    RestaurantId: 1,
    // Math.floor(Math.random() * 50) * 10 + 1,
    createdAt: new Date(),
    updatedAt: new Date()
  })
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Comments', comments, {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Comments', null, {})
  }
};
