const request = require('supertest');
const config = require('../Configuration/config.json');
const key = require('../Configuration/apikey.json');
const location = require('../Configuration/Locations/location.json');
const locationPatchOne = require('../Configuration/Locations/locationPatchOne.json');
const locationPatchAll = require('../Configuration/Locations/locationPatchAll.json');
const worker = require('../Configuration/Workers/worker.json');
const workerLocation = require('../Configuration/Workers/workerLocation.json');

jest.retryTimes(8, {logErrorsBeforeRetry: false, waitBeforeRetry: 2000, retryImmediately: true});

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

    test('GET unauthorized many Locations', async()=>{
        let response = await request(config.baseURL)
            .get('/locations')
            .set('Authorization', 'thisIsAnInvalidAPIKey');

        expect(response.statusCode).toBe(401);
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

    test('PATCH one value in a location', async()=>{
        let response = await request(config.baseURL)
            .patch('/locations')
            .send(locationPatchOne)
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);


    });

    test('and validate the one result', async()=>{
        await new Promise(r=>setTimeout(r, 3000));

        let response = await request(config.baseURL)
            .get('/locations/'+location.Id)
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);
        expect(response.body.Description).toBe('PATCH - DESCRIPTION');
    });

    test('PATCH a location back', async()=>{
        let response = await request(config.baseURL)
            .patch('/locations')
            .send(location)
            .set('Authorization', key.APIKey)

        expect(response.statusCode).toBe(200);
    });

    test('and validate restored value', async ()=>{
        await new Promise(r=>setTimeout(r, 3000));

        let response = await request(config.baseURL)
            .get('/locations/'+location.Id)
            .set('Authorization', key.APIKey);

        expect(response.body).toHaveProperty("Address");
        expect(response.body.Description).toBe("FOR API TESTING - DESCRIPTION");
    });

    test('PATCH all values in a location', async()=>{
        let response = await request(config.baseURL)
            .patch('/locations')
            .send(locationPatchAll)
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);
    });

    test('and validate the patch-all result', async()=>{
        await new Promise(r=>setTimeout(r, 3000));

        let response = await request(config.baseURL)
            .get('/locations/'+location.Id)
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject(locationPatchAll);
    });

    test('PATCH all of a location back', async()=>{
        let response = await request(config.baseURL)
            .patch('/locations')
            .send(location)
            .set('Authorization', key.APIKey)

        expect(response.statusCode).toBe(200);
    });

    test('and validate the restored values', async ()=>{
        await new Promise(r=>setTimeout(r, 3000));

        let response = await request(config.baseURL)
            .get('/locations/'+location.Id)
            .set('Authorization', key.APIKey);

        expect(response.body).toHaveProperty("Address");
        expect(response.body.Description).toBe("FOR API TESTING - DESCRIPTION");
    });
});

//PUT is not tested as locations are not deletable and the only PUT is location creation

describe('Test DELETE/POST Location endpoints', ()=>{

    test('unauthorized deactivate a Location', async()=>{
        let response = await request(config.baseURL)
            .delete('/locations/status')
            .send({'LocationId': location.Id})
            .set('Authorization', 'thisIsAnInvalidAPIKey');
        
        expect(response.statusCode).toBe(401);
    });

    test('deactivate a Location', async()=>{
        let response = await request(config.baseURL)
            .delete('/locations/status')
            .send({'LocationId': location.Id})
            .set('Authorization', key.APIKey);
        
        expect(response.statusCode).toBe(200);
    });

    test('then check that the Location is archived', async()=>{
        await new Promise(r=>setTimeout(r, 2000));

        let response = await request(config.baseURL)
            .get('/locations/'+location.Id)
            .set('Authorization', key.APIKey);

        await expect(response.statusCode).toBe(200);
        await expect(response.body.IsArchived).toBe(true);
    });

    test('Reactivate a Location', async()=>{
        let response = await request(config.baseURL)
            .post('/locations/status')
            .send({'LocationId': location.Id})
            .set('Authorization', key.APIKey);
        
        expect(response.statusCode).toBe(200);
    });

    test('and check that the Location is not archived', async()=>{
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

