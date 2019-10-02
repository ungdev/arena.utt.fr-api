const isAuth = require('../../middlewares/isAuth');

module.exports = (app) => {
  app.post('/users/:userId/carts', isAuth());

  app.post('/users/:userId/carts', async (req, res) => {
    const { Cart } = req.app.locals.models;

    if (req.params.userId !== req.user.id) {
      return res
        .status(403)
        .json({ error: 'UNAUTHORIZED' })
        .end();
    }

    const draftCount = await Cart.count({
      where: {
        userId: req.params.userId,
        transactionState: 'draft',
      },
    });

    console.log('count : ' + draftCount);

    if (draftCount !== 0) {
      return res
        .status(400)
        .json({ error: 'DUPLICATE_ENTRY' })
        .end();
    }

    await Cart.create({ userId: req.params.userId });

    return res
      .status(204)
      .end();
  });
};