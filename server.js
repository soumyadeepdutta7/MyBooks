const express = require('express');
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
require('dotenv').config();
const { isAuthenticated, isAdmin } = require('./middlewares/auth');

const createUserTable = require('./models/User');
const createOrderTable = require('./models/Order');
const mongoConnect = require('./config/mongo');

const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const bookRoutes = require('./routes/bookRoutes');
const cors = require('cors');
const db_url  = process.env.MONGODB_URI;
const app = express();

// Database initialization
(async () => {
  try {
    
    await createUserTable();
    await createOrderTable();
    await mongoConnect( db_url );
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1); 
  }
})();

// app.use(bodyParser.json());
app.use(express.json());
// app.use(cookieParser());
app.use(cors({origin:process.env.FRONTEND_URL}));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    // secure: true,
    httpOnly: true,
  }
}));
app.use(morgan('dev'));
app.get('/',(req,res)=>{
  try{
    res.status(200).send("this is my home route")
  }catch(err){

  }
})
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/auth', authRoutes);
app.use('/api/orders', isAuthenticated, orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/books', bookRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
