import request from 'supertest';
import app from '../../src/app';

describe('Products API', () => {
  let authToken: string;

  beforeEach(async () => {
    // Register and get auth token
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    authToken = response.body.token;
  });

  describe('POST /api/products', () => {
    it('should create a new product successfully', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Laptop Pro 15',
          sku: 'LAP-PRO-15-001',
          description: 'High-performance laptop with 15-inch display',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Laptop Pro 15');
      expect(response.body.sku).toBe('LAP-PRO-15-001');
      expect(response.body.description).toBe('High-performance laptop with 15-inch display');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Laptop Pro 15',
          sku: 'LAP-PRO-15-001',
          description: 'High-performance laptop',
        });

      expect(response.status).toBe(401);
    });

    it('should fail with invalid data (empty name)', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '',
          sku: 'LAP-001',
          description: 'Test description',
        });

      expect(response.status).toBe(400);
    });

    it('should fail with invalid data (SKU too long)', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Laptop',
          sku: 'A'.repeat(101), // 101 characters
          description: 'Test description',
        });

      expect(response.status).toBe(400);
    });

    it('should fail with duplicate SKU', async () => {
      // Create first product
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Product 1',
          sku: 'TEST-SKU-001',
          description: 'First product',
        });

      // Try to create second product with same SKU
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Product 2',
          sku: 'TEST-SKU-001',
          description: 'Second product',
        });

      expect(response.status).toBe(409);
      expect(response.body.error.message).toContain('SKU already exists');
    });
  });

  describe('GET /api/products', () => {
    beforeEach(async () => {
      // Create test products
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Laptop Pro 15', sku: 'LAP-PRO-15-001', description: 'High-performance laptop' });

      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Wireless Mouse', sku: 'MOU-WIR-001', description: 'Ergonomic wireless mouse' });

      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Mechanical Keyboard', sku: 'KEY-MEC-001', description: 'RGB mechanical keyboard' });
    });

    it('should list all products', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('total');
      expect(response.body.products).toHaveLength(3);
      expect(response.body.total).toBe(3);
    });

    it('should filter by name (partial match)', async () => {
      const response = await request(app)
        .get('/api/products?name=Laptop')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].name).toContain('Laptop');
    });

    it('should filter by SKU (partial match)', async () => {
      const response = await request(app)
        .get('/api/products?sku=001')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.products).toHaveLength(3); // All SKUs contain '001'
    });

    it('should filter by SKU (exact match)', async () => {
      const response = await request(app)
        .get('/api/products?sku=MOU-WIR-001')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].sku).toBe('MOU-WIR-001');
    });

    it('should support pagination with limit', async () => {
      const response = await request(app)
        .get('/api/products?limit=2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.products).toHaveLength(2);
      expect(response.body.total).toBe(3);
    });

    it('should support pagination with offset', async () => {
      const response = await request(app)
        .get('/api/products?limit=2&offset=1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.products).toHaveLength(2);
      expect(response.body.total).toBe(3);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/products');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get product by id', async () => {
      // Create a product
      const createResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Product',
          sku: 'TEST-001',
          description: 'Test description',
        });

      const productId = createResponse.body.id;

      // Get the product by ID
      const response = await request(app)
        .get(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(productId);
      expect(response.body.name).toBe('Test Product');
      expect(response.body.sku).toBe('TEST-001');
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      const response = await request(app)
        .get(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should fail with invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/products/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update product completely', async () => {
      // Create a product
      const createResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Original Product',
          sku: 'ORIG-001',
          description: 'Original description',
        });

      const productId = createResponse.body.id;

      // Update the product
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Product',
          sku: 'UPD-001',
          description: 'Updated description',
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Product');
      expect(response.body.sku).toBe('UPD-001');
      expect(response.body.description).toBe('Updated description');
    });

    it('should fail with missing fields', async () => {
      // Create a product
      const createResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Product',
          sku: 'TEST-001',
          description: 'Test description',
        });

      const productId = createResponse.body.id;

      // Try to update with missing fields
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Product',
          // Missing sku and description
        });

      expect(response.status).toBe(400);
    });

    it('should fail with duplicate SKU', async () => {
      // Create first product
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Product 1',
          sku: 'SKU-001',
          description: 'First product',
        });

      // Create second product
      const createResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Product 2',
          sku: 'SKU-002',
          description: 'Second product',
        });

      const productId = createResponse.body.id;

      // Try to update second product's SKU to match first product's SKU
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Product 2',
          sku: 'SKU-001', // Duplicate SKU
          description: 'Second product',
        });

      expect(response.status).toBe(409);
      expect(response.body.error.message).toContain('SKU already exists');
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      const response = await request(app)
        .put(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Product',
          sku: 'UPD-001',
          description: 'Updated description',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/products/:id', () => {
    it('should partially update product (single field)', async () => {
      // Create a product
      const createResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Original Product',
          sku: 'ORIG-001',
          description: 'Original description',
        });

      const productId = createResponse.body.id;

      // Update only description
      const response = await request(app)
        .patch(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated description only',
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Original Product'); // Unchanged
      expect(response.body.sku).toBe('ORIG-001'); // Unchanged
      expect(response.body.description).toBe('Updated description only'); // Changed
    });

    it('should partially update product (multiple fields)', async () => {
      // Create a product
      const createResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Original Product',
          sku: 'ORIG-001',
          description: 'Original description',
        });

      const productId = createResponse.body.id;

      // Update name and SKU
      const response = await request(app)
        .patch(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Product',
          sku: 'UPD-001',
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Product'); // Changed
      expect(response.body.sku).toBe('UPD-001'); // Changed
      expect(response.body.description).toBe('Original description'); // Unchanged
    });

    it('should fail with duplicate SKU on partial update', async () => {
      // Create first product
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Product 1',
          sku: 'SKU-001',
          description: 'First product',
        });

      // Create second product
      const createResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Product 2',
          sku: 'SKU-002',
          description: 'Second product',
        });

      const productId = createResponse.body.id;

      // Try to patch second product's SKU to match first product's SKU
      const response = await request(app)
        .patch(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sku: 'SKU-001', // Duplicate SKU
        });

      expect(response.status).toBe(409);
      expect(response.body.error.message).toContain('SKU already exists');
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      const response = await request(app)
        .patch(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Product',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete product', async () => {
      // Create a product
      const createResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Product to Delete',
          sku: 'DEL-001',
          description: 'This will be deleted',
        });

      const productId = createResponse.body.id;

      // Delete the product
      const response = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);

      // Verify product is deleted
      const getResponse = await request(app)
        .get(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      const response = await request(app)
        .delete(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should fail without authentication', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      const response = await request(app)
        .delete(`/api/products/${fakeId}`);

      expect(response.status).toBe(401);
    });
  });
});
