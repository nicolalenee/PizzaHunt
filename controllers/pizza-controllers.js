const router = require('express').Router();
const { Pizza } = require('../models');

const pizzaController = {

  // get all pizzas
  getAllPizza(req, res) {
    Pizza.find({})
    .populate({
      path: 'comments',
      select: '-__v'
    })
    .select('-__v')
    .sort({ _id: -1 })
    .then(dbPizzaData => res.json(dbPizzaData))
    .catch(err => {
      console.log(err);
      res.status(400).json(err);
    })
  },

  // get one pizza by id
  getPizzaById({ params }, res) {
    Pizza.findOne({ _id: params.id })
    .populate({
      path: 'comments',
      select: '-__v'
    })
    .select('-__v')
    .then(dbPizzaData => {
      // If no pizza is found, send 404
      if (!dbPizzaData) {
        res.status(404).json({ message: 'No pizza found with this id!' });
        return;
      }
      res.json(dbPizzaData);
    })
    .catch(err => {
      console.log(err);
      res.status(400).json(err);
    });
  },

  // create a new pizza (one or multiple)
  createPizza({ body }, res) {
    Pizza.create(body)
      .then(dbPizzaData => res.json(dbPizzaData))
      .catch(err => res.status(400).json(err));
  },

  // update a pizza by id
  updatePizza({params, body}, res) {
    Pizza.findOneAndUpdate({_id: params.id}, body, { new: true, runValidators: true })
    .then(dbPizzaData => {
      if (!dbPizzaData) {
        res.status(404).json({ message: 'No pizza found with this id!'})
        return;
      }
      res.json(dbPizzaData);
    })
    .catch(err => res.status(400).json(err));
  },

  // delete a pizza by id
  deletePizza({ params }, res) {
    Pizza.findOneAndDelete({ _id: params.id})
    .then(dbPizzaData => {
      if (!dbPizzaData) {
        res.status(404).json({ mesasge: 'No pizza found with this id!'})
        return;
      }
      res.json(dbPizzaData);
    })
    .catch(err => res.status(400).json(err))
  }
};

module.exports = pizzaController;