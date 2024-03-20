# Marketplace

## Schema & ERD Suggestion

### Common schemas

1. User schema: This schema would include fields such as user ID, username, email, password, and user role (buyer, seller, or admin).
2. Store schema: This schema would include fields such as store ID, storeName, ownerEmail, storeOwner Id, and address.
3. Review schema: This schema would include fields such as productID, productName, reviewerID, userReview, and reviewerName.
4. Product schema: This schema would include fields such as product ID, storeID, storeName, productName, description, price, unit, and genre.
5. OrderProduct schema: This schema would include fields such as orderID, productID, storeID, productName, productPrice, orderProductStatus.
6. Order schema: This schema would include fields such as customerID, customerName, deliverTo, orderStatus.

## Entity Relationship Diagram:

https://github.com/HuyTran0996/Marketplace/blob/main/marketplacediagram2024-02-21.pdf

## API endpoints

## Users:

### app.use('/api/v1/users');

### 1. router.post('/signup');

Sign Up user, role default is user, must login to DataBase to promote a user to admin

### 2. router.post('/login');

Login to the app

### 3. router.patch('/updateMyPassword');

User can update password

### 4. router.patch('/forgotPassword');

User can get new password if they forgot

### 5. router.get('/');

fetch all users (for admin dashboard)

### 6. router.get('/:id')

fetch a user by user ID

### 7. router.get('/myInfo')

fetch info of user currently login

### 8. router.patch('/:id')

update user information by user ID

### 9. router.patch('/updateMe')

update user currently login

### 10. router.delete('/deleteMe')

user can delete their own account

### 11. router.delete('/:id')

Admin can delete any user

### 11. router.get('/adminActivateUser/:id')

Admin can re-activate a user if they are deleted

## Stores:

## app.use('/api/v1/stores');

### 1. router.get('/')

fetch all stores

### 2. router.post('/')

user can create their store, (a user can have only one store)

### 3. router.get('/:id')

fetch a store by store ID

### 4. router.patch('/:id')

update store informations by store ID

### 5. router.delete('/:id')

Admin can delete any store by store ID

### 6. router.get('/adminActivateStore/:id')

Admin can re-activate a store that was deleted by store ID

## Reviews

### app.use('/api/v1/reviews');

### 1. router.get('/')

fetch all reviews of a product

### 2. router.post('/:id')

create a review for a product by product ID

### 3. router.patch('/:id')

update a review by review ID

### 4. router.delete('/:id')

only admin can delete review by review ID

### 5. router.get('/adminActivateReview/:id')

only admin can re-activate review that was deleted by review ID

## Product

### app.use('/api/v1/products');

### 1. router.get('/')

fetch all products, fetch all product of a store

### 2. router.post('/')

create a product

### 3. router.get('/:id')

get a product by product ID

### 4. router.patch('/:id')

update a product by product ID

### 5. router.delete('/:id')

admin can delete any product
store owner can delete their products

## Order

### app.use('/api/v1/orders');

### 1. router.get('/')

getAllOrders

### 2. router.post('/createOrder')

createOrder

### 3. router.get('/:id')

getOrder by order ID

### 4. router.patch('/:id')

updateOrder by order ID

### 5. router.patch('/cancelOrder/:id')

cancel order by order ID

### 6. router.delete('/:id')

adminDeleteOrder by order ID

//only admin can delete Order

## OrderProduct

### app.use('/api/v1/orderProducts');

### 1. router .get('/')

getAllOrderProducts

### 2. router.post('/')

createOrderProduct

### 3. router.patch('/:id')

updateOrderProduct

### 4. router.delete('/:id')

deleteOrderProduct
