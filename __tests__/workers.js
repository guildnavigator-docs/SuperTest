const request = require('supertest');
const config = require('../Configuration/config.json');
const key = require('../Configuration/apikey.json');
const entities = require('../Configuration/entities.json');
const worker = require('../Configuration/worker.json');
const workerPatch = require('../Configuration/workerPatch.json');

const { EventEmitterAsyncResource } = require('supertest/lib/test');


describe('Test Workers endpoints', ()=>{
    test('GET should return the Workers details', async()=>{

        const response = await request(config.baseURL)
            .get('/workers/'+entities.WorkerID)
            .set("Authorization", key.APIKey)

        expect(response.statusCode).toBe(200)
        expect(response.body).toMatchObject(worker)

    });

    test('GET unauthorized should return 401', async()=>{

        const response = await request(config.baseURL)
            .get('/workers/'+entities.WorkerID)
            .set("Authorization", "thisIsAnInvalidAPIKey")

        expect(response.statusCode).toBe(401);
    });

    test('GET all should return array of object workers', async()=>{

        const response = await request(config.baseURL)
            .get('/workers')
            .set('Authorization', key.APIKey);
        

        expect(response.body).toEqual(expect.any(Array));
    });

    test('PATCH a workers profile and validate update', async()=>{

        let response = await request(config.baseURL)
            .patch('/workers')
            .send(workerPatch)
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);

        response = await request(config.baseURL)
            .patch('/workers')
            .send(worker)
            .set('Authorization', key.APIKey)

        expect(response.statusCode).toBe(200);

        response = await request(config.baseURL)
            .get('/workers/'+worker.Id)
            .set('Authorization', key.APIKey);

        expect(response.body).toHaveProperty("EmergencyNotes");
        expect(response.body.EmergencyNotes).toBe("FOR API TESTING - NOTES");
    });
});