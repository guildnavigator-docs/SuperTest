const request = require('supertest');
const config = require('../Configuration/config.json');
const key = require('../Configuration/apikey.json');
const { EventEmitterAsyncResource } = require('supertest/lib/test');



describe('register', ()=>{
    test.skip('dd', async()=>{

        const response = await request(config.baseURL).get('/workers')
        expect(response.statusCode).toBe(200)

    });
});