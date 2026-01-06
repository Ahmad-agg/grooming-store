import express from 'express';
import Stripe from 'stripe';
import { ENV } from '../config/env.js';
import { requireAuth } from '../middleware/authz.js';

export const payments = express.Router();

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY); 

payments.post('/intent', requireAuth, async (req, res, next) => {
  try {
    const { amount_cents, currency = 'usd' } = req.body || {};
    if (!amount_cents || amount_cents <= 0) {
      return res.status(400).json({ error: { code: 400, message: 'Invalid amount' } });
    }

    const intent = await stripe.paymentIntents.create({
      amount: amount_cents,
      currency: currency.toLowerCase(),
      metadata: { user_id: req.user.id.toString() },
    });

    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    next(err);
  }
});
