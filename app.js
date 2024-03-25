const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const userRouter = require('./routes/userRoutes');
const storeRouter = require('./routes/storeRoutes');
const productRouter = require('./routes/productRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const orderRouter = require('./routes/orderRoutes');
const orderProductRouter = require('./routes/orderProductRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();
// app.use(cors());
// app.use(
//   cors({
//     origin: ['http://localhost:3000'],
//     methods: ['POST', 'PUT', 'PATCH', 'GET', 'DELETE', 'OPTIONS', 'HEAD'],
//     credentials: true
//   })
// );

// app.use(
//   cors({
//     origin: ['https://marketplace-final-project.onrender.com'],
//     methods: ['POST', 'PUT', 'PATCH', 'GET', 'DELETE', 'OPTIONS', 'HEAD'],
//     credentials: true
//   })
// );

const allowedOrigins = [
  'http://localhost:3000',
  'https://marketplace-final-project.onrender.com',
  'https://marketplace-front-end-2024.netlify.app'
];

// The corsOptions object is configured with a function for the origin property. This function checks if the request's origin is in the allowedOrigins array. If it is, the callback is called with null (indicating no error) and true (indicating the origin is allowed). If the origin is not in the array, an error is passed to the callback.

const corsOptions = {
  origin: function(origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new AppError('Not allowed by CORS', 404));
    }
  },
  methods: ['POST', 'PUT', 'PATCH', 'GET', 'DELETE', 'OPTIONS', 'HEAD'],
  credentials: true
};
app.use(cors(corsOptions));

app.options('*', cors());

// Set security HTTP headers
app.use(helmet());

app.use(morgan('dev'));

// Limit 500 requests in 1 hour from same API
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests, please try again in an hour'
});

app.use('./api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: ['price', 'orderStatus']
  })
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

//  ROUTES
app.use('/api/v1/users', userRouter);
app.use('/api/v1/stores', storeRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/orderProducts', orderProductRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
