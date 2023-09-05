import path from "path";
import express from "express";
import dotenv from "dotenv";
import fileupload from "express-fileupload";
import cookieParser from "cookie-parser"
dotenv.config();
import connectDB from "./config/db.js";

import {notFound, errorHandler} from './middleware/errorMiddleware.js'

import bootcampRoute from "./routes/bootcampRoutes.js";
import couseRoute from "./routes/couseRoutes.js";
import authRoute from "./routes/authRoutes.js";
import userRoute from "./routes/userRoutes.js";
import reviewRoute from "./routes/reviewRoute.js";

const port = process.env.PORT || 5000;

//CONNECT TO MONGODB
connectDB();

//INITIALIZE EXPRESS
const app = express();

//BODY PARSER MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//COOKIE PARSER MIDDLEWARE
app.use(cookieParser());

//File upload
app.use(fileupload());

//Set a static folder
const __dirname = path.resolve(); //Set __dir to current directory
app.use(express.static(path.join(__dirname, 'public')));

//ROUTES 
app.get('/', (req, res) => res.send('API Running'));

app.use('/api/bootcamps', bootcampRoute);
app.use('/api/courses', couseRoute);
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/reviews', reviewRoute);


app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`Server running on ${port}`));