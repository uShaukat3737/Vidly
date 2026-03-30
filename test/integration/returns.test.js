const request = require('supertest');
const mongoose = require('mongoose');
const { Rental } = require('../../models/rental');
const { Movie } = require('../../models/movie');
const { User } = require('../../models/user');

describe('/api/returns', () => {

  let server;
  let customerId;
  let movieId;
  let rental;
  let token;
  let movie;

  const execute = () => {
    return request(server)
      .post('/api/returns')
      .set('x-auth-token', token)
      .send({ customerId, movieId });
  };

  beforeEach(async () => {
    server = require('../../index');

    customerId = new mongoose.Types.ObjectId();
    movieId = new mongoose.Types.ObjectId();
    token = new User().generateAuthToken();

    movie = new Movie({
      _id: movieId,
      title: 'movie11',
      dailyRentalRate: 2,
      genre: { name: 'Action', likability: 3 },
      numberInStock: 10
    });
    await movie.save();

    rental = new Rental({
      customer: {
        _id: customerId,
        name: 'customer1',
        phone: '03301626751' // exactly 11 chars
      },
      movie: {
        _id: movieId,
        title: 'movie11',
        dailyRentalRate: 2
      }
    });
    await rental.save();
  });

  afterEach(async () => {
    await server.close();
    await Rental.deleteMany({});
    await Movie.deleteMany({});
    delete require.cache[require.resolve('../../index')];
  });

  describe('POST /', () => {

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

    it('should return 404 if no rental found for this customer/movie', async () => {
      await Rental.deleteMany({});
      const res = await execute();
      expect(res.status).toBe(404);
    });

    it('should return 400 if rental has already been returned', async () => {
      rental.dateReturned = new Date(); 
      await rental.save();

      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 200 if request is valid', async () => {
      const res = await execute();
      expect(res.status).toBe(200);
    });

    it('should set dateReturned if input is valid', async () => {
      await execute();
      const rentalInDb = await Rental.findById(rental._id);
      const diff = new Date() - rentalInDb.dateReturned;
      expect(diff).toBeLessThan(10 * 1000);
    });

    it('should calculate the rental fee correctly', async () => {
      rental.dateOut = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      await rental.save();

      await execute();

      const rentalInDb = await Rental.findById(rental._id);
      expect(rentalInDb.rentalFee).toBe(14); // 7 days * $2/day
    });

    it('should increment the movie stock', async () => {
      await execute();
      const movieInDb = await Movie.findById(movieId);
      expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
    });

    it('should return the rental in the response body', async () => {
      const res = await execute();
      expect(res.body).toHaveProperty('_id', rental._id.toHexString());
      expect(res.body).toHaveProperty('customer.name', rental.customer.name);
      expect(res.body).toHaveProperty('movie.title', rental.movie.title);
    });
  });
});
