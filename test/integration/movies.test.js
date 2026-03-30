const request = require('supertest');
const mongoose = require('mongoose');
const { Movie } = require('../../models/movie');
const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');

describe('/api/movies', () => {

  let server;

  beforeEach(async () => {
    server = require('../../index');
    await Movie.deleteMany({});
    await Genre.deleteMany({});
  });

  afterEach(async () => {
    await server.close();
    await Movie.deleteMany({});
    await Genre.deleteMany({});
    delete require.cache[require.resolve('../../index')];
  });

  describe('GET /', () => {

    it('should return all movies', async () => {
      const genre = new Genre({ name: 'Action', likability: 4 });
      await genre.save();

      await Movie.collection.insertMany([
        { title: 'movie1', genre: { _id: genre._id, name: genre.name }, numberInStock: 5, dailyRentalRate: 2 },
        { title: 'movie2', genre: { _id: genre._id, name: genre.name }, numberInStock: 3, dailyRentalRate: 1 }
      ]);

      const res = await request(server).get('/api/movies');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(m => m.title === 'movie1')).toBeTruthy();
      expect(res.body.some(m => m.title === 'movie2')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {

    it('should return 400 if invalid id is passed', async () => {
      const res = await request(server).get('/api/movies/1');
      expect(res.status).toBe(400);
    });

    it('should return 404 if no movie found with the given id', async () => {
      const res = await request(server).get('/api/movies/' + new mongoose.Types.ObjectId());
      expect(res.status).toBe(404);
    });

    it('should return the movie if valid id is passed', async () => {
      const genre = new Genre({ name: 'Action', likability: 4 });
      await genre.save();

      const movie = new Movie({
        title: 'movie1',
        genre: { _id: genre._id, name: genre.name },
        numberInStock: 5,
        dailyRentalRate: 2
      });
      await movie.save();

      const res = await request(server).get('/api/movies/' + movie._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title', movie.title);
    });
  });

  describe('POST /', () => {

    let token;
    let title;
    let genreId;
    let numberInStock;
    let dailyRentalRate;
    let genre;

    const execute = () => {
      return request(server)
        .post('/api/movies')
        .set('x-auth-token', token)
        .send({ title, genreId, numberInStock, dailyRentalRate });
    };

    beforeEach(async () => {
      genre = new Genre({ name: 'Action', likability: 4 });
      await genre.save();

      token = new User().generateAuthToken();
      title = 'movie1';
      genreId = genre._id;
      numberInStock = 5;
      dailyRentalRate = 2;
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';
      const res = await execute();
      expect(res.status).toBe(401);
    });

    it('should return 400 if title is less than 5 chars', async () => {
      title = '1234';
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 400 if title is greater than 50 chars', async () => {
      title = Array(52).join('a');
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 400 if numberInStock is negative', async () => {
      numberInStock = -1;
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 400 if dailyRentalRate is less than 1', async () => {
      dailyRentalRate = 0;
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 400 if genreId is invalid', async () => {
      genreId = new mongoose.Types.ObjectId(); // valid format, but no genre in DB
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should save the movie if input is valid', async () => {
      await execute();
      const movieInDb = await Movie.findOne({ title: 'movie1' });
      expect(movieInDb).not.toBeNull();
    });

    it('should return the movie if input is valid', async () => {
      const res = await execute();
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('title', 'movie1');
      expect(res.body).toHaveProperty('numberInStock', 5);
      expect(res.body).toHaveProperty('dailyRentalRate', 2);
      expect(res.body.genre).toHaveProperty('name', 'Action');
    });
  });

  describe('PUT /:id', () => {

    let token;
    let movie;
    let movieId;
    let genre;
    let newTitle;
    let newGenreId;
    let newNumberInStock;
    let newDailyRentalRate;

    const execute = () => {
      return request(server)
        .put('/api/movies/' + movieId)
        .set('x-auth-token', token)
        .send({ title: newTitle, genreId: newGenreId, numberInStock: newNumberInStock, dailyRentalRate: newDailyRentalRate });
    };

    beforeEach(async () => {
      genre = new Genre({ name: 'Action', likability: 4 });
      await genre.save();

      movie = new Movie({
        title: 'movie1',
        genre: { _id: genre._id, name: genre.name },
        numberInStock: 5,
        dailyRentalRate: 2
      });
      await movie.save();

      movieId = movie._id;
      token = new User().generateAuthToken();
      newTitle = 'updatedTitle';
      newGenreId = genre._id;
      newNumberInStock = 10;
      newDailyRentalRate = 3;
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';
      const res = await execute();
      expect(res.status).toBe(401);
    });

    it('should return 400 if title is less than 5 chars', async () => {
      newTitle = '1234';
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 400 if title is greater than 50 chars', async () => {
      newTitle = Array(52).join('a');
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 400 if numberInStock is negative', async () => {
      newNumberInStock = -1;
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 400 if dailyRentalRate is less than 1', async () => {
      newDailyRentalRate = 0;
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 400 if genreId does not exist', async () => {
      newGenreId = new mongoose.Types.ObjectId();
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 400 if id is invalid', async () => {
      movieId = '1';
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 404 if no movie found with the given id', async () => {
      movieId = new mongoose.Types.ObjectId();
      const res = await execute();
      expect(res.status).toBe(404);
    });

    it('should update the movie if input is valid', async () => {
      await execute();
      const updatedMovie = await Movie.findById(movieId);
      expect(updatedMovie.title).toBe(newTitle);
      expect(updatedMovie.numberInStock).toBe(newNumberInStock);
      expect(updatedMovie.dailyRentalRate).toBe(newDailyRentalRate);
    });

    it('should return the updated movie', async () => {
      const res = await execute();
      expect(res.body).toHaveProperty('_id', movieId.toHexString());
      expect(res.body).toHaveProperty('title', newTitle);
      expect(res.body).toHaveProperty('numberInStock', newNumberInStock);
    });
  });

  describe('DELETE /:id', () => {

    let token;
    let movie;
    let movieId;
    let genre;

    const execute = () => {
      return request(server)
        .delete('/api/movies/' + movieId)
        .set('x-auth-token', token);
    };

    beforeEach(async () => {
      genre = new Genre({ name: 'Action', likability: 4 });
      await genre.save();

      movie = new Movie({
        title: 'movie1',
        genre: { _id: genre._id, name: genre.name },
        numberInStock: 5,
        dailyRentalRate: 2
      });
      await movie.save();

      movieId = movie._id;
      token = new User().generateAuthToken();
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';
      const res = await execute();
      expect(res.status).toBe(401);
    });

    it('should return 400 if id is invalid', async () => {
      movieId = '1';
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 404 if no movie found with the given id', async () => {
      movieId = new mongoose.Types.ObjectId();
      const res = await execute();
      expect(res.status).toBe(404);
    });

    it('should delete the movie if input is valid', async () => {
      await execute();
      const movieInDb = await Movie.findById(movieId);
      expect(movieInDb).toBeNull();
    });

    it('should return the deleted movie', async () => {
      const res = await execute();
      expect(res.body).toHaveProperty('_id', movieId.toHexString());
      expect(res.body).toHaveProperty('title', movie.title);
    });
  });
});
