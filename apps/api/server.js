import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import compression from 'compression';
import './config/passport.js';

import { ENV } from './config/env.js';

import { corsMiddleware } from './config/cors.js';
import { health } from './routes/health.js';
import { errorHandler } from './middleware/error-handler.js';
import { catalog } from './routes/catalog.js';
import { dbcheck } from './routes/dbcheck.js';
import { home } from './routes/home.js';
import { about } from './routes/about.js';
import { contact } from './routes/contact.js';
import { auth } from './routes/auth.js';
import { cart } from './routes/cart.js';
import { wishlist } from './routes/wishlist.js';
import { payments } from './routes/payments.js';
import { checkout } from './routes/checkout.js';
import { orders } from './routes/orders.js';
import { sellerProducts } from './routes/seller-products.js';
import { sellerDashboard } from './routes/seller-dashboard.js';

const app = express();

app.use(compression()); 

if (ENV.NODE_ENV === 'production') {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: ["'self'", ENV.CORS_ORIGIN],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'", 'https://js.stripe.com'],
          frameSrc: ["'self'", 'https://js.stripe.com'],
        },
      },
    })
  );
} else {
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
}

app.use(morgan('dev'));
app.use(corsMiddleware);
app.use(express.json());
app.use(cookieParser());

app.set('trust proxy', 1);
app.use(passport.initialize());

app.set('etag', false);


const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20, 
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 429,
      message: 'Too many auth requests. Please try again later.',
    },
  },
});

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60, 
  standardHeaders: true,
  legacyHeaders: false,
});

const cartLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

const ordersLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const noStore = (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
};

app.use('/api/auth', authLimiter, noStore);
app.use('/api/cart', cartLimiter, noStore);
app.use('/api/checkout', checkoutLimiter, noStore);
app.use('/api/orders', ordersLimiter, noStore);


app.use('/', health);
app.use('/', home);
app.use('/', catalog);
app.use('/', about);
app.use('/', contact);
app.use('/', cart);
app.use('/', wishlist);
app.use('/api/payments', payments);
app.use('/api/checkout', checkout);
app.use('/api/orders', orders);
app.use('/api/seller/products', sellerProducts);
app.use('/api/seller/dashboard', sellerDashboard);
app.use('/', auth);
app.use('/', dbcheck);

app.use((req, res) =>
  res.status(404).json({ error: { code: 404, message: 'Not Found' } })
);

app.use(errorHandler);

if (ENV.NODE_ENV !== 'test') {
  app.listen(ENV.PORT, () => {
    console.log(`API listening on http://localhost:${ENV.PORT} (env: ${ENV.NODE_ENV})`);
  });
}
export default app;