const jwt = require('jsonwebtoken');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VJZCI6MSwiaWF0IjoxNzY4NDg3OTg0LCJleHAiOjE4MDAwMjM5ODR9.nb-NobjAwsH7UcOueA7ScWz0KMORYEE5M12py8JNcm8';

try {
    const decoded = jwt.decode(token);
    console.log('Decoded JWT payload:');
    console.log(JSON.stringify(decoded, null, 2));
} catch (error) {
    console.error('Error decoding JWT:', error.message);
}
