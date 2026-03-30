const request = require('supertest');
const {User} = require('../../models/user');

describe('auth middleware', () => {
  
  let server;
  let token;

  beforeEach(() => { 
    server = require('../../index'); 
  });
  
  afterEach(async () => {
    await server.close();
    delete require.cache[
      require.resolve('../../index')
    ]; 
  });

  const execute =  () => { 
    return request(server)
      .post('/api/genres')
      .set('x-auth-token', token)
      .send({name: 'genre1', likability: 4});
  };

  beforeEach(() => {
    token = new User().generateAuthToken();
  });

  it('should return 401 if no token is provided', async () => {  
    token = '';
    
    const res = await execute();
    expect(res.status).toBe(401);
  });

  it('should return 400 if invalid token is provided', async () => {  
    token = 'a';
    
    const res = await execute();
    expect(res.status).toBe(400);
  });

  it('should return 200 if token is valid', async () => {  
    const res = await execute();
    
    expect(res.status).toBe(200);
  });
});
