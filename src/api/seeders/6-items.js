/* eslint-disable no-unused-vars */

module.exports = {
  up: (queryInterface, Sequelize) => {
    let items = [{
      id: 1,
      name: 'Place joueur',
      key: 'player',
      price: 20,
    }, {
      id: 2,
      name: 'Place coach / manager / accompagnateur',
      key: 'visitor',
      price: 12,
      stock: 40,
    }, {
      id: 3,
      name: 'Câble ethernet (5m)',
      key: 'ethernet5',
      price: 7,
      infos: 'Un câble ethernet de 5m est requis pour se brancher aux switchs des tables',
    }, {
      id: 4,
      name: 'Câble ethernet (7m)',
      key: 'ethernet7',
      price: 10,
      infos: 'Un câble ethernet de 7m plus long pour les joueurs situés en bout de table',
    }, {
      id: 5,
      name: 'Multiprise 3 trous',
      key: 'multiSocket',
      price: 5,
      infos: 'Une multiprise 3 trous pour brancher tout ton setup',
    }, {
      id: 6,
      name: 'T-shirt UA 2019 (Homme)',
      key: 'maleTshirt',
      price: 13,
      infos: 'Un t-shirt souvenir de cette LAN de folie',
      image: 'tshirt.png',
    }, {
      id: 7,
      name: 'T-shirt UA 2019 (Femme)',
      key: 'femaleTshirt',
      price: 13,
      infos: 'Un t-shirt souvenir de cette LAN de folie',
      image: 'tshirt.png',
    }, {
      id: 8,
      name: 'Ticket tombola',
      key: 'tombola',
      price: 1,
      infos: 'Pour participer à la tombola qui aura lieu pendant le weekend',
    }, {
      id: 9,
      name: 'Pin\'s',
      key: 'pins',
      price: 1,
      infos: 'Un pin\'s doré souvenir de cette LAN de folie',
      image: 'pins.png',
    }];

    items = items.map((item) => ({
      ...item,
      stock: item.stock ? item.stock : -1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return queryInterface.bulkInsert('items', items);
  },
};
