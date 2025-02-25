import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as Redis from 'ioredis';
// FIX: need to initialize Firebase prior to import of app.
// there's probably a better way to fix this issue.
admin.initializeApp();

import { RegisterRoutes } from '../build/routes';

import * as openapi from '../build/swagger.json';
import { rateLimiterMiddleware } from './middlewares/rateLimiter/rateLimiter';
import {
  IRateLimiterStoreOptions,
  RateLimiterRedis,
} from 'rate-limiter-flexible';

// THIS FILE SHOULDN'T RUN WITHOUT FIREBASE EMULATOR!
// nor is it meant to be. use server.ts!

export const app = express();
// a slight "hack" to get things to play well in Cloud Functions
// none of the below is required when running locally.
// Since the CDN rewrite rule in firebase.json sends all requests that start with `/api`
// to the Cloud Function but the Express app doesn't have a route that starts
// with `/api`, we need to remove it or make another router with app.use('/api', actualRouter)`
const API_PREFIX = 'api';
app.use((req, res, next) => {
  if (req.url.indexOf(`/${API_PREFIX}/`) === 0) {
    req.url = req.url.substring(API_PREFIX.length + 1);
  }
  next();
});

if (functions.config()?.ratelimit?.enabled && functions.config()?.redis?.uri) {
  try {
    const config = functions.config().redis.uri;
    const redis = new Redis(config); // uses defaults unless given configuration object

    const options: IRateLimiterStoreOptions = {
      storeClient: redis,
      keyPrefix: `middleware:rate-limit`,
      points: 20,
      duration: 1, // per 1 second by IP
    };

    const rateLimiter = new RateLimiterRedis(options);
    app.use(rateLimiterMiddleware(rateLimiter));
  } catch (e) {
    console.error(e);
  }
}

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

// DO NOT CHANGE UNLESS firebase.json record is updated as well.

// Use body parser to read sent json payloads
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

// TODO: can probably accomplish the same thing using hosting.
// serve the OpenAPI spec.
app.get('/openapi.json', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(openapi);
});

RegisterRoutes(app);

// By default, /api/* will be routed to this Express app.
export const api = functions
  .runWith({
    // Ensure the function has enough memory and time
    // to process large files
    timeoutSeconds: 60,
    memory: '512MB',
  })
  .https.onRequest(app);
