# PizzaHunt

## Description
A progressive web application that allows users to post about anything pizza related. From the best pizza to the worst, users are encouraged to post their creative ideas and opinion on pizza from all over the world! Users can even create posts while offline. 

![image](https://user-images.githubusercontent.com/86696492/182634362-4dc60308-e697-443b-b07b-283f0ca5fef1.png)


## Usage
Users are able to sign-in and post about pizza, comment on recipes, and create threads within the comments. Users do not need to sign up or sign-in, only leave a name or alias on each pizza or comment. This is a free pizza world and we would love everyone to join with no committment! 

<img width="1349" alt="image" src="https://user-images.githubusercontent.com/86696492/199129042-d45d8cfb-ffee-4480-b04c-be98fc0b2a9e.png">


## Technologies
* Node.js
* Express.js
* MongoDB / mongoose
* IndexedDB 


For this project, a NoSQL approach was used because it allows easy storage and retrieval of unstructured data, which can significantly improve performance especially for applications that can use a lot of data. This feature will all the application to be able to accommodate the client's fluid ideas: new types of applications with very large, ever-changing datasets.

This app also utilizes IndexedDB to save data locally to the browser when there's no internet connection. 

## API Organization
On the backend, we followed standard RESTful API structure. However, to stick even tighter to this method, functionality and endpoints were separated into two separate directories. Although there are more files to track, the code is more readable with these concerns separated.

Let's view an example of a controller for updating the pizza model. For this, the controller is represented as an object with a number of different methods. Here, we perform CRUD operations on the pizza model which we created using mongoose as an Object Document Map.

```javascript
const pizzaController => {
  getAllPizza(req, res) {
    Pizza.find({})
    .then(dbPizzaData => res.json(dbPizzaData))
    .catch(err =>{
      console.log(err);
      res.status(400).json(err);
    })
  },
  getPizzaById({ params }, res) {
    Pizza.findOne({_id: params.id})
    .then(dbPizzaData => {
      if (!dbPizzaData) {
        res.status(400).json({ message: 'No pizza found with this id!'});
        return;
      }
      res.json(dbPizzaData);
    })
    .catch(err => {
      console.log(err);
      res.status(400).json(err);
    })
  },
  createPizza({ body }, res) {
    Pizza.create(body)
    .then(dbPizzaData => res.json(dbPizzaData))
    .catch(err => res.status(400).json(err));
  },
  updatePizza({ params, body }, res ) {
    Pizza.findOneAndUpdate(
      { _id: params.id },
       body, 
       { new: true }
    )
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
Since these methods will serve as callback functions for our various routes, we can easily hook them into our routes. Express.Router() is a valuable asset for this purpose. 

```javascript
const router = require('express').Router();
/* /api/pizzas */
router
  .route('/')
  .get(getAllPizza)
  .post(createPizza);
/* /api/pizza/:id */
router
  .route(':/id')
  .get(getPizzaById)
  .put(updatePizza)
  .delete(deletePizza);
module.exports = router;
```
Finally, we call these routes and gather the information on the front-end using standard vanilla javascript. Check out the snippet below of the function to submit a pizza (aka add an entry to the database):
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

## PWA Configuration
Pizza is a global affair. Sometimes pizza's influence can be so impactful that users may want to update or add a pizza right then and there while they're at a restaraunt. Pizza Hunt wants users to be able to add that information to the database even if user's don't have access to the internet!

To accomplish this, we implemented IndexedDB, a NoSQL client-side storage API in the browser. This allows us to manage data-persistence by saving data locally to the browser when there's no internet connection.

After establishing a database connection, we can open transactions on that database to hold the information that the user entered and submit it once internet connection has been restored. The code block below contains demonstrates this process:
```javascript
// this function will be executed when the user's connection comes back online so that way we can post that information to the database
function uploadPizza() {
  // open a transaction on your db 
  const transaction = db.transaction(['new_pizza'], 'readwrite');
  // access your object store
  const pizzaObjectStore = transaction.objectStore('new_pizza');
  // get all records from store and set to a variable
  const getAll = pizzaObjectStore.getAll();
  // upon a successful .getAll() execution, run this function
  getAll.onsuccess = function() {
    // if there was data in the store, send it to the api server
    if (getAll.result.length > 0) {
      fetch('/api/pizzas', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(serverResponse => {
        if (serverResponse.message) {
          throw new Error(serverResponse);
        }
        // open one more transaction
        const transaction = db.transaction(['new_pizza'], 'readwrite');
        // access the new_pizza object store
        const pizzaObjectStore = transaction.objectStore('new_pizza');
        // clear all items in your store
        pizzaObjectStore.clear();

        alert('All saved pizza has been submitted!');
      })
      .catch(err => {
        console.log(err);
      })
    }
  }
};

```
To test this, we can use Chrome Dev Tools to simulate a device without internet connection. Navigating to the Network tab, and turn the Network option to "offline". 
<img width="1284" alt="image" src="https://user-images.githubusercontent.com/86696492/199740579-f60b975c-9e1c-4c0c-bf8a-9a1424fdeddf.png">

Next, we should submit a pizza (without refreshing the page) and recieve an error on the form, as follows: 
<img width="1328" alt="image" src="https://user-images.githubusercontent.com/86696492/199741294-abbb49ff-5a58-4e94-8111-d483b8ca0a69.png">

After we've done that, we want to navigate to the Application tab. In the left column, under Storage, locate IndexedDB and select the `new_pizza` object store. You should see something like this:
<img width="1583" alt="image" src="https://user-images.githubusercontent.com/86696492/199743146-148afc32-80e6-4862-94d9-ae32e5701643.png">
(If you don't see anything, you may have to enter "0" in the text box that prompts for the starting key).

These steps demonstrate that the information has been stored in the object store. To finish testing this process, navigate back to the Network tab in Chrome Dev Tools. Switch the network option back to an online status. The POST request should take place automatically with a `200` status code.
<img width="1583" alt="image" src="https://user-images.githubusercontent.com/86696492/199744796-19c8af33-e1b5-4659-8ce9-49ec98372ea0.png">

## Links
[Repository](https://github.com/nicolalenee/PizzaHunt)  
[Deployment](https://vast-garden-75186.herokuapp.com)
