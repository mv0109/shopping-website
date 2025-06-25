// test-endpoints.js - Complete API endpoint tester
const baseURL = 'http://localhost:3000/api';

async function testEndpoint(method, endpoint, data = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${baseURL}${endpoint}`, options);
        const result = await response.json();
        
        console.log(`✅ ${method} ${endpoint}`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Success: ${result.success}`);
        console.log(`   Message: ${result.message || 'No message'}`);
        if (result.data) {
            console.log(`   Data: ${JSON.stringify(result.data).substring(0, 100)}...`);
        }
        console.log('');
        
        return result;
    } catch (error) {
        console.log(`❌ ${method} ${endpoint}`);
        console.log(`   Error: ${error.message}`);
        console.log('');
        return null;
    }
}

async function runTests() {
    console.log('🧪 Testing ShopEasy API Endpoints...\n');

    // Test health check
    await testEndpoint('GET', '/health');

    // Test products
    await testEndpoint('GET', '/products');
    await testEndpoint('GET', '/products/1');
    
    // Test creating a product
    const newProduct = await testEndpoint('POST', '/products', {
        name: 'Test Product',
        price: 199.99,
        description: 'A test product',
        category: 'Test',
        stock: 10,
        image: '🧪'
    });

    // Test updating a product (if creation was successful)
    if (newProduct && newProduct.data) {
        await testEndpoint('PUT', `/products/${newProduct.data.id}`, {
            name: 'Updated Test Product',
            price: 249.99
        });
    }

    // Test categories
    await testEndpoint('GET', '/categories');

    // Test user registration
    const newUser = await testEndpoint('POST', '/users/register', {
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123'
    });

    // Test user login
    if (newUser && newUser.success) {
        await testEndpoint('POST', '/users/login', {
            email: 'test@example.com',
            password: 'testpassword123'
        });
    }

    // Test creating an order
    const newOrder = await testEndpoint('POST', '/orders', {
        customerName: 'Test Customer',
        customerEmail: 'customer@example.com',
        items: [
            {
                productId: 1,
                quantity: 2
            }
        ]
    });

    // Test updating order status
    if (newOrder && newOrder.data) {
        await testEndpoint('PUT', `/orders/${newOrder.data.id}/status`, {
            status: 'processing'
        });
    }

    // Test getting orders
    await testEndpoint('GET', '/orders');

    // Test stats
    await testEndpoint('GET', '/stats');

    // Test invalid endpoint
    await testEndpoint('GET', '/invalid-endpoint');

    console.log('✨ API testing completed!');
}

// Check if server is running first
async function checkServer() {
    try {
        const response = await fetch(baseURL + '/health');
        if (response.ok) {
            console.log('🟢 Server is running, starting tests...\n');
            runTests();
        } else {
            console.log('🔴 Server responded but with error status:', response.status);
        }
    } catch (error) {
        console.log('🔴 Server is not running. Please start the server first:');
        console.log('   npm start');
        console.log('   or');
        console.log('   node server.js');
    }
}

checkServer();