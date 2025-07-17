const request = require('supertest');
const config = require('../Configuration/config.json');
const key = require('../Configuration/apikey.json');
const entities = require('../Configuration/entities.json');
const location = require('../Configuration/location.json');

jest.retryTimes(8, {logErrorsBeforeRetry: false, waitBeforeRetry: 2000});

describe('Test GET Location endpoints', ()=>{

    test('GET one location', async()=>{
        let response = await request(config.baseURL)
            .get('/locations/'+location.Id)
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject(location);

    });
});