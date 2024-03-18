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

### 4. router.get('/');

fetch all users (for admin dashboard)

### 5. router.get('/:id')

fetch a user by user ID

### 6. router.patch('/:id')

update user information

### 7. router.delete('/deleteMe')

user can delete their own account

### 8. router.delete('/:id')

Admin can delete any user

## Stores:

## app.use('/api/v1/stores');

### 1. router.get('/')

fetch all stores

### 2. router.post('/')

user can create their store

### 3. router.get('/:id')

fetch a store

### 4. router.patch('/:id')

update store informations

### 5. router.delete('/:id')

Admin can delete any store

## Reviews

### app.use('/api/v1/reviews');

### 1. router.get('/')

fetch all reviews of a product

### 2. router.post('/:id')

create a review, this route uses ID of the product

### 3. router.patch('/:id')

update a review, this routes use ID of review

### 4. router.delete('/:id')

only admin can delete review so if reviewer use bad language, store owner can report reviewer to admin

## Product

### app.use('/api/v1/products');

### 1. router.get('/')

fetch all products, fetch all product of a store

### 2. router.post('/')

create a product

### 3. router.get('/:id')

get a product

### 4. router.patch('/:id')

update a product

### 5. router.delete('/:id')

admin can delete any product

## Order

### app.use('/api/v1/orders');

### 1. router.get('/')

getAllOrders

### 2. router.post('/')

createOrder

### 3. router.get('/:id')

getOrder

### 4. router.patch('/:id')

updateOrder

### 5. router.delete('/:id')

adminDeleteOrder

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
