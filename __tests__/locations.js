const request = require('supertest');
const config = require('../Configuration/config.json');
const key = require('../Configuration/apikey.json');
const location = require('../Configuration/Locations/location.json');
const locationPatchOne = require('../Configuration/Locations/locationPatchOne.json');
const worker = require('../Configuration/worker.json');
const workerLocation = require('../Configuration/workerLocation.json');

jest.retryTimes(8, {logErrorsBeforeRetry: false, waitBeforeRetry: 2000});

describe('Test GET Location endpoints', ()=>{

    test('GET one location', async()=>{
        let response = await request(config.baseURL)
            .get('/locations/'+location.Id)
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject(location);

        expect(response.body).toHaveProperty('Id');
        expect(response.body).toHaveProperty('Name');
        expect(response.body).toHaveProperty('Description');
        expect(response.body).toHaveProperty('Address');
        expect(response.body).toHaveProperty('StartDate');
        expect(response.body).toHaveProperty('EndDate');
        expect(response.body).toHaveProperty('CreatingCompanyId');
        expect(response.body).toHaveProperty('IsArchived');
        expect(response.body).toHaveProperty('CreatedOn');
    });

    test('GET unauthorized one Location', async()=>{
        let response = await request(config.baseURL)
            .get('/locations/'+location.Id)
            .set("Authorization", "thisIsAnInvalidAPIKey")

        expect(response.statusCode).toBe(401);
    });

    test('GET many Locations', async()=>{
        let response = await request(config.baseURL)
            .get('/locations')
            .set('Authorization', key.APIKey);

        expect(response.body).toEqual(expect.any(Array));
    });
});

describe('Test PATCH Location endpoints', ()=>{

    test('PATCH unauthorized', async()=>{
        let response = await request(config.baseURL)
            .patch('/locations')
            .send(locationPatchOne)
            .set('Authorization', 'thisIsAnInvalidAPIKey');

        expect(response.statusCode).toBe(401);
    });

    test('PATCH a location and validate', async()=>{
        let response = await request(config.baseURL)
            .patch('/locations')
            .send(locationPatchOne)
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);

        response = await request(config.baseURL)
            .get('/locations/'+location.Id)
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);
        expect(response.body.Description).toBe('PATCH - DESCRIPTION');
    });

    test('PATCH a location back and validate update', async()=>{

        //Patch them back
        let response = await request(config.baseURL)
            .patch('/locations')
            .send(location)
            .set('Authorization', key.APIKey)

        expect(response.statusCode).toBe(200);

        //Get the patched value and check it was changed
        response = await request(config.baseURL)
            .get('/locations/'+location.Id)
            .set('Authorization', key.APIKey);

        expect(response.body).toHaveProperty("Address");
        expect(response.body.Address).toBe("FOR API TESTING - ADDRESS");
    });
});

//PUT is not tested as locations are not deletable and the only PUT is location creation

describe('Test DELETE Location endpoints', ()=>{

    test('DELETE unauthorized deactivate a Location', async()=>{
        let response = await request(config.baseURL)
            .delete('/locations/status')
            .send({'LocationId': location.Id})
            .set('Authorization', 'thisIsAnInvalidAPIKey');
        
        expect(response.statusCode).toBe(401);

    });

    test('DELETE deactivate a Location', async()=>{
        let response = await request(config.baseURL)
            .delete('/locations/status')
            .send({'LocationId': location.Id})
            .set('Authorization', key.APIKey);
        
        expect(response.statusCode).toBe(200);
        console.log(response.body)
    });

    test('GET check that the Location is archived', async()=>{
        let response = await request(config.baseURL)
            .get('/locations/'+location.Id)
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);
        expect(response.body.IsArchived).toBe(true);
    });

    test('POST it back to active', async()=>{
        let response = await request(config.baseURL)
            .post('/locations/status')
            .send({'LocationId': location.Id})
            .set('Authorization', key.APIKey);
        
        expect(response.statusCode).toBe(200);
    });

    test('GET check that the Location is not archived', async()=>{
        let response = await request(config.baseURL)
            .get('/locations/'+location.Id)
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);
        expect(response.body.IsArchived).toBe(false);
    });

    test('DELETE unassign a Worker from a Location', async()=>{
        let response = await request(config.baseURL)
            .delete('/locations/worker')
            .send({
                'LocationId': location.Id,
                'WorkerId': worker.Id
            })
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);
    });

    test('GET check that that Worker is no longer assigned', async()=>{
        let response = await request(config.baseURL)
            .get('/workers/'+worker.Id+'/locations')
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(expect.any(Array));
        expect(response.body.length).toBe(0);
    });

    test('POST assign the Worker to a Location', async()=>{
        let response = await request(config.baseURL)
            .post('/locations/worker')
            .send({
                'LocationId': location.Id,
                'WorkerId': worker.Id
            })
            .set('Authorization', key.APIKey);
        
        expect(response.statusCode).toBe(200);
    });

    test('GET check that that Worker is assigned', async()=>{
        let response = await request(config.baseURL)
            .get('/workers/'+worker.Id+'/locations')
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(expect.any(Array));
        expect(response.body.length).toBe(1);
        expect(response.body[0]).toMatchObject(workerLocation);

        expect(response.body[0]).toHaveProperty('Id');
        expect(response.body[0]).toHaveProperty('CreatedOn');
        expect(response.body[0]).toHaveProperty('LastModifiedOn');
        expect(response.body[0]).toHaveProperty('CreatedBy');
        expect(response.body[0]).toHaveProperty('LastModifiedBy');
        expect(response.body[0]).toHaveProperty('IsDeleted');
        expect(response.body[0]).toHaveProperty('Name');
        expect(response.body[0]).toHaveProperty('Description');
        expect(response.body[0]).toHaveProperty('Address');
        expect(response.body[0]).toHaveProperty('StartDate');
        expect(response.body[0]).toHaveProperty('EndDate');
        expect(response.body[0]).toHaveProperty('CreatingCompanyId');
        expect(response.body[0]).toHaveProperty('IsArchived');
        expect(response.body[0]).toHaveProperty('VisibleToAllCompanyEmployees');
    });
});