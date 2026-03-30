
const request = require('supertest');
const mongoose = require('mongoose');
const {Genre} = require('../../models/genre');
const {User} = require('../../models/user');

describe('/api/genres', () => {
  
  let server;
  beforeEach(async () => { 
    server = require('../../index'); 
    await Genre.deleteMany({});
  });

  afterEach(async () => {
    await server.close();
    await Genre.deleteMany({}); // Clean up after test 
    delete require.cache[
      require.resolve('../../index')
    ]; 
  });

  describe('GET /', () => {
    
    it('should return all genres', async () => {
     await Genre.collection.insertMany([
        {name: 'genre1'},
        {name: 'genre2'},
      ]);
      
      const res = await request(server).get('/api/genres');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
      expect(res.body.some(g => g.name === 'genre2')).toBeTruthy();  
    });
  });

  describe('GET /:id', () => {
    
    it('should return a genre if valid id is passed', async () => {
      
      const genre = new Genre({name: 'genre1'});
      await genre.save();

      const res = await request(server).get('/api/genres/' + genre._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', genre.name);
    });

    it('should return 404 errror if invalid id is passed', async () => {

      const res = await request(server).get('/api/genres/1');
      expect(res.status).toBe(404);
    });

  });  

  describe('POST /', () => {
    
    let token;
    let name;
    let likability;
    
    const execute = async () => {
      return await request(server)
        .post('/api/genres')
        .set('x-auth-token', token)
        .send({name, likability});
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = 'genre1';
      likability = 3;
    });


    it('should return 401 if client is not logged in', async () => {  
      
      token = '';
      const res = await execute();
      
      expect(res.status).toBe(401);
    });

    it('should return 400 if genre is less than 5 chars', async () => {  
      
      token = new User().generateAuthToken();
      name = '1234';
      const res = await execute();
      
      expect(res.status).toBe(400);
    });

    it('should return 400 if genre is greater than 50 chars', async () => {  
      
      name = Array(52).join('a'); // 'aaaaa...' (51 times)
      token = new User().generateAuthToken();
      
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 400 if likability is greater than 5', async () => {  
      token = new User().generateAuthToken();
      likability = 6;
      
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 400 if likability is lesser than 0', async () => {  
      token = new User().generateAuthToken();
      likability = -1;
      
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should save the genre if it is valid', async () => {  
      
      await execute();
      
      const genre = await Genre.find({name: 'genre1'});
      expect(genre).not.toBeNull();
    });

    it('should return the genre if it is valid', async () => {  
      
      token = new User().generateAuthToken();
      
      const res = await execute();
      
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'genre1');
      expect(res.body).toHaveProperty('likability', 3);
    });

  });

  describe('DELETE /:id', () => {
    
    let token;
    let genre;
    let genreId;

    const execute = async () => {
      return await request(server)
        .delete('/api/genres/' + genreId)
        .set('x-auth-token', token)
        .send();
    };

    beforeEach(async () => {
      genre = new Genre({name: 'genre1', likability: 4});
      await genre.save();

      genreId = genre._id;
      token = new User({isAdmin: true}).generateAuthToken();
    });

    it('should return 401 if client is not logged in', async () => {  
      token = '';
      
      const res = await execute();
      expect(res.status).toBe(401);
    });

    it('should return 403 if the user is not an admin', async () => {  
      token = new User({isAdmin: false}).generateAuthToken();
      
      const res = await execute();
      expect(res.status).toBe(403);
    });

    it('should return 404 if id is invalid', async () => {  
      genreId = '1';
      
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 404 if no genre with the given id was found', async () => {  
      genreId = new mongoose.Types.ObjectId();
      
      const res = await execute();
      expect(res.status).toBe(404);
    });

    it('should delete the genre if input is valid', async () => {  
      await execute();
      
      const genreInDb = await Genre.findById(genreId);
      expect(genreInDb).toBeNull();
    });

    it('should return the removed genre', async () => {  
      const res = await execute();
      
      expect(res.body).toHaveProperty('_id', genreId.toHexString());
      expect(res.body).toHaveProperty('name', genre.name);
    });

  });

  describe('PUT /:id', () => {
    
    let token;
    let newName;
    let newLikability;
    let genre;
    let genreId;

    const execute = async () => {
      return await request(server)
        .put('/api/genres/' + genreId)
        .set('x-auth-token', token)
        .send({name: newName, likability: newLikability});
    };  
    beforeEach(async () => {
      genre = new Genre({name: 'genre1', likability: 2});
      await genre.save();

      genreId = genre._id;
      token = new User().generateAuthToken();
      newName = 'updatedName';
      newLikability = 4;
    });

    it('should return 401 if client is not logged in', async () => {  
      token = '';
      
      const res = await execute();
      expect(res.status).toBe(401);
    });

    it('should return 400 if genre is less than 5 chars', async () => {  
      newName = '1234';
      
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 400 if genre is greater than 50 chars', async () => {  
      newName = Array(52).join('a'); // 'aaaaa...' (51 times)
      
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 400 if likability is greater than 5', async () => {  
      newLikability = 6;
      
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 400 if likability is lesser than 0', async () => {  
      newLikability = -1;
      
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 400 if id is invalid', async () => {  
      genreId = '1';
      
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it('should return 404 if genre with the given id was not found', async () => {  
      genreId = new mongoose.Types.ObjectId();
      
      const res = await execute();
      expect(res.status).toBe(404);
    });

    it('should update the genre if input is valid', async () => {  
      await execute();
      
      const updatedGenre = await Genre.findById(genreId);
      expect(updatedGenre.name).toBe(newName);
      expect(updatedGenre.likability).toBe(newLikability);
    });

    it('should return the updated genre', async () => {  
      const res = await execute();
      
      expect(res.body).toHaveProperty('_id', genreId.toHexString());
      expect(res.body).toHaveProperty('name', newName);
      expect(res.body).toHaveProperty('likability', newLikability);
    });

  });    
});
