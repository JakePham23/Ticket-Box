'use strict'
import express from 'express';
import shoppingCartController from "../controllers/shoppingCart.controller.js";

const router = express.Router();
// Update shopping cart by customerId
router.put('/api/shopping-cart/:customerID', shoppingCartController.updateShoppingCart);

export default router;