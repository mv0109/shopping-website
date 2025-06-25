// server.js - Complete ShopEasy Backend Server
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// In-memory data storage (replace with database in production)
let products = [
    {
        id: 1,
        name: "Premium Smartphone",
        price: 899,
        description: "Latest technology with cutting-edge features and elegant design",
        category: "Electronics",
        stock: 50,
        image: "📱"
    },
    {
        id: 2,
        name: "Ultra Laptop",
        price: 1299,
        description: "High-performance laptop for professionals and creators",
        category: "Electronics",
        stock: 30,
        image: "💻"
    },
    {
        id: 3,
        name: "Wireless Headphones",
        price: 299,
        description: "Crystal-clear audio with noise cancellation technology",
        category: "Electronics",
        stock: 100,
        image: "🎧"
    },
    {
        id: 4,
        name: "Smart Watch",
        price: 399,
        description: "Fitness tracking and smart notifications on your wrist",
        category: "Electronics",
        stock: 75,
        image: "⌚"
    }
];

let orders = [];
let users = [];
let nextProductId = 5;
let nextOrderId = 1;
let nextUserId = 1;

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'ShopEasy API is running!',
        timestamp: new Date().toISOString()
    });
});

// Products Routes
app.get('/api/products', (req, res) => {
    try {
        const { category, search, minPrice, maxPrice } = req.query;
        let filteredProducts = [...products];

        // Filter by category
        if (category && category !== 'all') {
            filteredProducts = filteredProducts.filter(p => 
                p.category.toLowerCase() === category.toLowerCase()
            );
        }

        // Search by name or description
        if (search) {
            filteredProducts = filteredProducts.filter(p =>
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.description.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Filter by price range
        if (minPrice) {
            filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
        }
        if (maxPrice) {
            filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
        }

        res.json({
            success: true,
            data: filteredProducts,
            count: filteredProducts.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
});

app.get('/api/products/:id', (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
});

app.post('/api/products', (req, res) => {
    try {
        const { name, price, description, category, stock, image } = req.body;

        if (!name || !price || !description || !category) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, price, description, category'
            });
        }

        const newProduct = {
            id: nextProductId++,
            name,
            price: parseFloat(price),
            description,
            category,
            stock: parseInt(stock) || 0,
            image: image || '📦'
        };

        products.push(newProduct);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: newProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
});

app.put('/api/products/:id', (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const productIndex = products.findIndex(p => p.id === productId);

        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const { name, price, description, category, stock, image } = req.body;
        
        // Update product
        products[productIndex] = {
            ...products[productIndex],
            ...(name && { name }),
            ...(price && { price: parseFloat(price) }),
            ...(description && { description }),
            ...(category && { category }),
            ...(stock !== undefined && { stock: parseInt(stock) }),
            ...(image && { image })
        };

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: products[productIndex]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
});

app.delete('/api/products/:id', (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const productIndex = products.findIndex(p => p.id === productId);

        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const deletedProduct = products.splice(productIndex, 1)[0];

        res.json({
            success: true,
            message: 'Product deleted successfully',
            data: deletedProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
});

// Orders Routes
app.get('/api/orders', (req, res) => {
    try {
        res.json({
            success: true,
            data: orders,
            count: orders.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
});

app.get('/api/orders/:id', (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const order = orders.find(o => o.id === orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
});

app.post('/api/orders', (req, res) => {
    try {
        const { customerName, customerEmail, items, total } = req.body;

        if (!customerName || !customerEmail || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: customerName, customerEmail, items'
            });
        }

        // Validate items and check stock
        let calculatedTotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = products.find(p => p.id === item.productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product with ID ${item.productId} not found`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
                });
            }

            const itemTotal = product.price * item.quantity;
            calculatedTotal += itemTotal;

            orderItems.push({
                productId: product.id,
                productName: product.name,
                price: product.price,
                quantity: item.quantity,
                total: itemTotal
            });

            // Update stock
            product.stock -= item.quantity;
        }

        const newOrder = {
            id: nextOrderId++,
            customerName,
            customerEmail,
            items: orderItems,
            total: calculatedTotal,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        orders.push(newOrder);

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: newOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
});

app.put('/api/orders/:id/status', (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const { status } = req.body;
        
        const orderIndex = orders.findIndex(o => o.id === orderId);
        
        if (orderIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (!status || !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Valid statuses: pending, processing, shipped, delivered, cancelled'
            });
        }

        orders[orderIndex].status = status;
        orders[orderIndex].updatedAt = new Date().toISOString();

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: orders[orderIndex]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
});

// Users Routes (simple implementation)
app.post('/api/users/register', (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, email, password'
            });
        }

        // Check if user already exists
        if (users.find(u => u.email === email)) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        const newUser = {
            id: nextUserId++,
            name,
            email,
            password, // In production, hash this password!
            createdAt: new Date().toISOString()
        };

        users.push(newUser);

        // Don't return password
        const { password: _, ...userWithoutPassword } = newUser;

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: userWithoutPassword
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: error.message
        });
    }
});

app.post('/api/users/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: email, password'
            });
        }

        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Don't return password
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login successful',
            data: userWithoutPassword
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
});

// Categories Route
app.get('/api/categories', (req, res) => {
    try {
        const categories = [...new Set(products.map(p => p.category))];
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
});

// Stats Route (for admin)
app.get('/api/stats', (req, res) => {
    try {
        const stats = {
            totalProducts: products.length,
            totalOrders: orders.length,
            totalUsers: users.length,
            totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
            lowStockProducts: products.filter(p => p.stock < 10).length,
            ordersByStatus: {
                pending: orders.filter(o => o.status === 'pending').length,
                processing: orders.filter(o => o.status === 'processing').length,
                shipped: orders.filter(o => o.status === 'shipped').length,
                delivered: orders.filter(o => o.status === 'delivered').length,
                cancelled: orders.filter(o => o.status === 'cancelled').length
            }
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching stats',
            error: error.message
        });
    }
});

// Serve static files
app.use(express.static('public'));

// Routes for HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
        availableEndpoints: [
            'GET /api/health',
            'GET /api/products',
            'GET /api/products/:id',
            'POST /api/products',
            'PUT /api/products/:id',
            'DELETE /api/products/:id',
            'GET /api/orders',
            'GET /api/orders/:id',
            'POST /api/orders',
            'PUT /api/orders/:id/status',
            'POST /api/users/register',
            'POST /api/users/login',
            'GET /api/categories',
            'GET /api/stats'
        ]
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 Shopping Backend Server running on http://localhost:' + PORT);
    console.log('📊 Admin Panel: http://localhost:' + PORT + '/admin');
    console.log('🛍️ Shop: http://localhost:' + PORT + '/');
    console.log('📡 API Base URL: http://localhost:' + PORT + '/api');
    console.log('\n📋 Available API Endpoints:');
    console.log('   GET  /api/health');
    console.log('   GET  /api/products');
    console.log('   POST /api/products');
    console.log('   GET  /api/orders');
    console.log('   POST /api/orders');
    console.log('   GET  /api/stats');
    console.log('   POST /api/users/register');
    console.log('   POST /api/users/login');
});

module.exports = app;