const { Schema, model} = require('mongoose');

// create the schema
const PizzaSchema = new Schema({
  pizzaName: {
    type: String
  },
  createdBy: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  size: {
    type: String,
    default: 'Large'
  },
  toppings: []
});

// create the model using the schema from above
const Pizza = model('Pizza', PizzaSchema);

// export that pizza mode
module.exports = Pizza;