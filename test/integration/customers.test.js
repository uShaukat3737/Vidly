const request = require('supertest');
const mongoose = require('mongoose');
const { Customer } = require('../../models/customer');
const { User } = require('../../models/user');

describe('/api/customers', () => {

  let server;

  beforeEach(async () => {
    server = require('../../index');
    await Customer.deleteMany({});
  });

  afterEach(async () => {
    await server.close();
    await Customer.deleteMany({});
    delete require.cache[require.resolve('../../index')];
  });

  // NOTE: router.use(auth) protects ALL routes — every request needs a token.

  describe('GET /', () => {

    it('should return 401 if client is not logged in', async () => {
      const res = await request(server).get('/api/customers');
      expect(res.status).toBe(401);
    });

    it('should return all customers', async () => {
      await Customer.collection.insertMany([
        { name: 'customer1', phone: '03301626751', isGold: false },
        { name: 'customer2', phone: '03301626752', isGold: true }
      ]);

      const token = new User().generateAuthToken();
      const res = await request(server)
        .get('/api/customers')
        .set('x-auth-token', token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(c => c.name === 'customer1')).toBeTruthy();
      expect(res.body.some(c => c.name === 'customer2')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {

    it('should return 401 if client is not logged in', async () => {
      const customer = new Customer({ name: 'customer1', phone: '03301626751', isGold: false });
      await customer.save();

      const res = await request(server).get('/api/customers/' + customer._id);
      expect(res.status).toBe(401);
    });

    it('should return 400 if invalid id is passed', async () => {
      const token = new User().generateAuthToken();

      const res = await request(server)
        .get('/api/customers/1')
        .set('x-auth-token', token);

      expect(res.status).toBe(400);
    });

    it('should return 404 if no customer found with the given id', async () => {
      const token = new User().generateAuthToken();

      const res = await request(server)
        .get('/api/customers/' + new mongoose.Types.ObjectId())
        .set('x-auth-token', token);

      expect(res.status).toBe(404);
    });

    it('should return the customer if valid id is passed', async () => {
      const customer = new Customer({ name: 'customer1', phone: '03301626751', isGold: false });
      await customer.save();

      const token = new User().generateAuthToken();
      const res = await request(server)
        .get('/api/customers/' + customer._id)
        .set('x-auth-token', token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', customer.name);
    });
  });

  describe('POST /', () => {

    let token;
    let name;
    let phone;
    let isGold;

    const execute = () => {
      return request(server)
        .post('/api/customers')
        .set('x-auth-token', token)
        .send({ name, phone, isGold });
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = 'customer1';
      phone = '03301626751'; // exactly 11 chars — enforced by schema
      isGold = false;
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';
      const res = await execute();
      expect(res.status).toBe(401);
    });

    it('should return 400 if name is less than 5 chars', async () => {
      name = '1234';
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 400 if name is greater than 50 chars', async () => {
      name = Array(52).join('a');
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 400 if phone is not exactly 11 chars', async () => {
      phone = '1234567890'; // 10 chars
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 400 if isGold is not provided', async () => {
      isGold = undefined;
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should save the customer if input is valid', async () => {
      await execute();
      const customerInDb = await Customer.findOne({ name: 'customer1' });
      expect(customerInDb).not.toBeNull();
    });

    it('should return the customer if input is valid', async () => {
      const res = await execute();
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'customer1');
      expect(res.body).toHaveProperty('phone', '03301626751');
      expect(res.body).toHaveProperty('isGold', false);
    });
  });

  describe('PUT /:id', () => {

    let token;
    let customer;
    let customerId;
    let newName;
    let newPhone;
    let newIsGold;

    const execute = () => {
      return request(server)
        .put('/api/customers/' + customerId)
        .set('x-auth-token', token)
        .send({ name: newName, phone: newPhone, isGold: newIsGold });
    };

    beforeEach(async () => {
      customer = new Customer({ name: 'customer1', phone: '03301626751', isGold: false });
      await customer.save();

      customerId = customer._id;
      token = new User().generateAuthToken();
      newName = 'updatedName';
      newPhone = '03301626752';
      newIsGold = true;
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';
      const res = await execute();
      expect(res.status).toBe(401);
    });

    it('should return 400 if name is less than 5 chars', async () => {
      newName = '1234';
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 400 if name is greater than 50 chars', async () => {
      newName = Array(52).join('a');
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 400 if phone is not exactly 11 chars', async () => {
      newPhone = '1234567890'; // 10 chars
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 400 if id is invalid', async () => {
      customerId = '1';
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 404 if no customer found with the given id', async () => {
      customerId = new mongoose.Types.ObjectId();
      const res = await execute();
      expect(res.status).toBe(404);
    });

    it('should update the customer if input is valid', async () => {
      await execute();
      const updatedCustomer = await Customer.findById(customerId);
      expect(updatedCustomer.name).toBe(newName);
      expect(updatedCustomer.phone).toBe(newPhone);
      expect(updatedCustomer.isGold).toBe(newIsGold);
    });

    it('should return the updated customer', async () => {
      const res = await execute();
      expect(res.body).toHaveProperty('_id', customerId.toHexString());
      expect(res.body).toHaveProperty('name', newName);
      expect(res.body).toHaveProperty('phone', newPhone);
    });
  });

  describe('DELETE /:id', () => {

    let token;
    let customer;
    let customerId;

    const execute = () => {
      return request(server)
        .delete('/api/customers/' + customerId)
        .set('x-auth-token', token);
    };

    beforeEach(async () => {
      customer = new Customer({ name: 'customer1', phone: '03301626751', isGold: false });
      await customer.save();

      customerId = customer._id;
      token = new User().generateAuthToken();
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';
      const res = await execute();
      expect(res.status).toBe(401);
    });

    it('should return 400 if id is invalid', async () => {
      customerId = '1';
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 404 if no customer found with the given id', async () => {
      customerId = new mongoose.Types.ObjectId();
      const res = await execute();
      expect(res.status).toBe(404);
    });

    it('should delete the customer if input is valid', async () => {
      await execute();
      const customerInDb = await Customer.findById(customerId);
      expect(customerInDb).toBeNull();
    });

    // NOTE: Route has a bug — it sends `genre` variable instead of `customer`.
    // This test will fail until that is fixed in routers/customers.js.
    it('should return the deleted customer', async () => {
      const res = await execute();
      expect(res.body).toHaveProperty('_id', customerId.toHexString());
      expect(res.body).toHaveProperty('name', customer.name);
    });
  });
});
