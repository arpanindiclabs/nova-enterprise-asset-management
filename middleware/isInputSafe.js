const isInputSafe = (input) => {
    // Match any dangerous characters commonly used in SQL injection
    const pattern = /['";\-\--\/*]/;
    return !pattern.test(input);
};
module.exports = isInputSafe;