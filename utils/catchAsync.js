module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Here's a breakdown of how catchAsync works and why it's effective for error handling in this context:

// Error Handling: The catchAsync function takes an asynchronous function (fn) as an argument. It returns a new function that, when called, executes fn and listens for any errors it throws. If an error is caught, it is passed to the next function, which is expected to be an Express.js error handling middleware.
// Asynchronous Error Handling: This approach is particularly useful for handling errors in asynchronous operations, such as database queries or file operations, which are common in web applications. Without catchAsync, you would need to wrap every asynchronous operation in a try...catch block, which can lead to verbose and hard-to-maintain code.
// Centralized Error Handling: By using catchAsync, you centralize error handling in a single middleware function. This is beneficial because it allows you to handle errors consistently across your application and avoids duplicating error handling logic.
// Express.js Middleware Compatibility: The use of next to pass errors along to the next middleware function is a pattern commonly used in Express.js applications. This pattern allows for a clean separation of concerns, where error handling is decoupled from the business logic of your routes.
