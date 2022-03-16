jest.setTimeout(60000);

const mongoose = require('mongoose');
require('../models/User');
const config = require('../config/keys');

mongoose.Promise = global.Promise;
mongoose.connect(config.mongoURI);