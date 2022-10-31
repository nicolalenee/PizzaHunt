# PizzaHunt

## Description
A progressive web application that allows users to post about anything pizza related. From the best pizza to the worst, users are encouraged to post their creative ideas and opinion on pizza from all over the world! Users can even create posts while offline. 

![image](https://user-images.githubusercontent.com/86696492/182634362-4dc60308-e697-443b-b07b-283f0ca5fef1.png)


## Usage
Users are able to sign-in and post about pizza, comment on recipes, and create threads within the comments. 

## Technologies
* Node.js
* Express.js
* MongoDB / mongoose
* IndexedDB
For this project, a NoSQL approach was used because it allows easy storage and retrieval of unstructured data, which can significantly improve performance especially for applications that can use a lot of data. This feature will all the application to be able to accommodate the client's fluid ideas: new types of applications with very large, ever-changing datasets.

This app also utilizes IndexedDB to save data locally to the browser when there's no internet connection. 

## API Organization
On the backend, we followed standard RESTful API structure. However, to stick even tighter to this method, functionality and endpoints were separated into two separate directories. Although there are more files to track, the code is more readable with these concerns separated.

Let's view an example of a controller for updating the pizza model. For this, the controller is represented as an object with a number of different methods. Here, we perform CRUD operations on the pizza object using mongoose as an Object Document Map.

```javascript
const pizzaController = {
	getAllPizza(req, res) {
		Pizza.find({})
			.then(dbPizzaData => res.json(dbPizzaData))
			.catch(err =>
				console.log(err);
				res.status(400).json(err);
	},
	getPizzaById({params}, res) {
		Pizza.findOne({_id: params.id})
			.then(dbPizzaData => {
				if(!dbPizzaData) {
					res.status(400).json({ message: 'No pizza found with this id!'});
					return;
				}
        res.json(dbPizzaData);
			})
			.catch(err => {
				console.log(err);
				res.status(400).json(err);
			});
	},
	createPizza({ body}, res) {
		Pizza.create(body)
			.then(dbPizzaData => res.json(dbPizzaData))
			.catch(err => res.status(400).json(err));
	},
	updatePizza({ params, body }, res) {
	  Pizza.findOneAndUpdate({ _id: params.id }, body, { new: true })
	    .then(dbPizzaData => {
	      if (!dbPizzaData) {
	        res.status(404).json({ message: 'No pizza found with this id!' });
	        return;
	      }
	      res.json(dbPizzaData);
	    })
	    .catch(err => res.status(400).json(err));
	},

	deletePizza({ params }, res) {
  Pizza.findOneAndDelete({ _id: params.id })
    .then(dbPizzaData => {
      if (!dbPizzaData) {
        res.status(404).json({ message: 'No pizza found with this id!' });
        return;
      }
      res.json(dbPizzaData);
    })
    .catch(err => res.status(400).json(err));
	}
}
```
Since these methods will serve as callback functions for our various routes, we can easily hook them into our routes. Express router() is a valuable asset for this purpose. 

```javascript
const router = require('express').Router();
/* /api/pizzas */
router
	.route('/')
	.get(getAllPizza)
	.post(createPizza);
/* /api/pizzas/:id */
router
	.route('/:id')
	.get(getPizzaById)
	.put(updatePizza)
	.delete(deletePizza);

module.exports = router;
```
Finally, we call these routes and gather the information on the front-end using standard vanilla javascript. Check out the snippet below of the functioon to submit a pizza (aka add an entry to the database):
```javascript
const handlePizzaSubmit = event => {
  event.preventDefault();

  const pizzaName = $pizzaForm.querySelector('#pizza-name').value;
  const createdBy = $pizzaForm.querySelector('#created-by').value;
  const size = $pizzaForm.querySelector('#pizza-size').value;
  const toppings = [...$pizzaForm.querySelectorAll('[name=topping]:checked')].map(topping => {
    return topping.value;
  });

  if (!pizzaName || !createdBy || !toppings.length) {
    return;
  }

  const formData = { pizzaName, createdBy, size, toppings };

  fetch('/api/pizzas', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
  .then(response => response.json())
  .then(postResponse => {
    alert('Pizza created successfully!');
    console.log(postResponse);
  })
  .catch(err => {
    console.log(err);
    saveRecord(formData);
  })
};
```
Here, we hit the `/api/pizzas` route and using a `POST` method. This calls the `createPizza()` method that we defined in the controller object.
## Links
[Repository](https://github.com/nicolalenee/PizzaHunt)  
[Deployment](https://vast-garden-75186.herokuapp.com)
