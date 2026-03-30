const request = require('supertest');
const mongoose = require('mongoose');
const { Rental } = require('../../models/rental');
const { Movie } = require('../../models/movie');
const { Customer } = require('../../models/customer');
const { User } = require('../../models/user');

describe('/api/rentals', () => {

  let server;

  beforeEach(async () => {
    server = require('../../index');
    await Rental.deleteMany({});
    await Movie.deleteMany({});
    await Customer.deleteMany({});
  });

  afterEach(async () => {
    await server.close();
    await Rental.deleteMany({});
    await Movie.deleteMany({});
    await Customer.deleteMany({});
    delete require.cache[require.resolve('../../index')];
  });

  describe('GET /', () => {

    it('should return 401 if client is not logged in', async () => {
      const res = await request(server).get('/api/rentals');
      expect(res.status).toBe(401);
    });

    it('should return all rentals', async () => {
      await Rental.collection.insertMany([
        {
          customer: { _id: new mongoose.Types.ObjectId(), name: 'customer1', phone: '03301626751' },
          movie: { _id: new mongoose.Types.ObjectId(), title: 'movie11', dailyRentalRate: 2 }
        },
        {
          customer: { _id: new mongoose.Types.ObjectId(), name: 'customer2', phone: '03301626752' },
          movie: { _id: new mongoose.Types.ObjectId(), title: 'movie22', dailyRentalRate: 3 }
        }
      ]);

      const token = new User().generateAuthToken();
      const res = await request(server)
        .get('/api/rentals')
        .set('x-auth-token', token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(r => r.customer.name === 'customer1')).toBeTruthy();
      expect(res.body.some(r => r.customer.name === 'customer2')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {

    it('should return 401 if client is not logged in', async () => {
      const rental = new Rental({
        customer: { _id: new mongoose.Types.ObjectId(), name: 'customer1', phone: '03301626751' },
        movie: { _id: new mongoose.Types.ObjectId(), title: 'movie11', dailyRentalRate: 2 }
      });
      await rental.save();

      const res = await request(server).get('/api/rentals/' + rental._id);
      expect(res.status).toBe(401);
    });

    it('should return 404 if no rental found with the given id', async () => {
      const token = new User().generateAuthToken();

      const res = await request(server)
        .get('/api/rentals/' + new mongoose.Types.ObjectId())
        .set('x-auth-token', token);

      expect(res.status).toBe(404);
    });

    it('should return the rental if valid id is passed', async () => {
      const rental = new Rental({
        customer: { _id: new mongoose.Types.ObjectId(), name: 'customer1', phone: '03301626751' },
        movie: { _id: new mongoose.Types.ObjectId(), title: 'movie11', dailyRentalRate: 2 }
      });
      await rental.save();

      const token = new User().generateAuthToken();
      const res = await request(server)
        .get('/api/rentals/' + rental._id)
        .set('x-auth-token', token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id', rental._id.toHexString());
      expect(res.body).toHaveProperty('customer');
      expect(res.body).toHaveProperty('movie');
    });
  });

  // NOTE: The POST route in routers/rentals.js references an undefined `session`
  // variable (leftover from a MongoDB transaction attempt). All POST requests will
  // currently throw ReferenceError and return 500. Fix the route before these pass.
  describe('POST /', () => {

    let token;
    let customerId;
    let movieId;
    let customer;
    let movie;

    const execute = () => {
      return request(server)
        .post('/api/rentals')
        .set('x-auth-token', token)
        .send({ customerId, movieId });
    };

    beforeEach(async () => {
      customer = new Customer({ name: 'customer1', phone: '03301626751', isGold: false });
      await customer.save();

      movie = new Movie({
        title: 'movie11',
        genre: { name: 'Action', likability: 3 },
        numberInStock: 5,
        dailyRentalRate: 2
      });
      await movie.save();

      token = new User().generateAuthToken();
      customerId = customer._id;
      movieId = movie._id;
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';
      const res = await execute();
      expect(res.status).toBe(401);
    });

    it('should return 400 if customerId is not provided', async () => {
      customerId = '';
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 400 if movieId is not provided', async () => {
      movieId = '';
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 400 if customerId is not a valid ObjectId', async () => {
      customerId = '123';
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 400 if movieId is not a valid ObjectId', async () => {
      movieId = '123';
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 400 if customer does not exist', async () => {
      customerId = new mongoose.Types.ObjectId();
      const res = await execute();
      expect(res.status).toBe(400); // route returns 400, not 404
    });

    it('should return 400 if movie does not exist', async () => {
      movieId = new mongoose.Types.ObjectId();
      const res = await execute();
      expect(res.status).toBe(400); // route returns 400, not 404
    });

    it('should return 400 if movie is not in stock', async () => {
      movie.numberInStock = 0;
      await movie.save();

      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should save the rental if input is valid', async () => {
      await execute();
      const rentalInDb = await Rental.findOne({ 'customer._id': customerId });
      expect(rentalInDb).not.toBeNull();
      expect(rentalInDb.movie.title).toBe('movie11');
    });

    it('should decrement the movie stock on rental', async () => {
      await execute();
      const movieInDb = await Movie.findById(movieId);
      expect(movieInDb.numberInStock).toBe(movie.numberInStock - 1);
    });

    it('should return the rental if input is valid', async () => {
      const res = await execute();
      expect(res.body).toHaveProperty('_id');
      expect(res.body.customer.name).toBe('customer1');
      expect(res.body.movie.title).toBe('movie11');
    });
  });
});
