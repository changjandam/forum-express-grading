'use strict';
const bcrypt = require('bcryptjs')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [{
      id: 1,
      email: 'root@example.com',
      password: bcrypt.hashSync('12345678', 10, null),
      isAdmin: true,
      name: 'root',
      image: 'https://loremflickr.com/320/320/headshot',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: 11,
      email: 'user1@example.com',
      password: bcrypt.hashSync('12345678', 10, null),
      isAdmin: false,
      name: 'user1',
      image: 'https://loremflickr.com/320/320/headshot',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: 21,
      email: 'user2@example.com',
      password: bcrypt.hashSync('12345678', 10, null),
      isAdmin: false,
      name: 'user2',
      image: 'https://loremflickr.com/320/320/headshot',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {})
  }
};
