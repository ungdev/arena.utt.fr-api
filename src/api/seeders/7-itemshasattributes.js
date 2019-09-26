/* eslint-disable no-unused-vars */

module.exports = {
  up: (queryInterface, Sequelize) => {
    let itemshasattributes = [];

    for (let attributeId = 1; attributeId <= 5; attributeId += 1) {
      itemshasattributes.push({ attributeId, itemId: 1 }, { attributeId, itemId: 2 });
    }

    itemshasattributes = itemshasattributes.map((tournament) => ({
      ...tournament,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return queryInterface.bulkInsert('itemshasattributes', itemshasattributes);
  },
};
