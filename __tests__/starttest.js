const request = require('supertest');
const { EventEmitterAsyncResource } = require('supertest/lib/test');



describe('register', ()=>{
    test('dd', async()=>{

        const response = await request('https://pokeapi.co/api/v2/').get('/pokemon/ditto')
        expect(response.statusCode).toBe(200)

    });
});