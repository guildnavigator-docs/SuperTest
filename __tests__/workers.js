const request = require('supertest');
const config = require('../Configuration/config.json');
const key = require('../Configuration/apikey.json');
const entities = require('../Configuration/entities.json');
const worker = require('../Configuration/worker.json');
const workerPatchOne = require('../Configuration/workerPatchOne.json');
const workerPatchAll = require('../Configuration/workerPatchAll.json');
const workerPutOne = require('../Configuration/workerPutOne.json');
const workerPutAll = require('../Configuration/workerPutAll.json');
const location = require('../Configuration/workerLocation.json');

const { EventEmitterAsyncResource } = require('supertest/lib/test');

jest.retryTimes(8, {logErrorsBeforeRetry: false, waitBeforeRetry: 2000});

beforeAll(async ()=>{
    //Activate Worker
    let response = await request(config.baseURL)
        .post('/workers/status')
        .send({"WorkerId": worker.Id})
        .set('Authorization', key.APIKey);

    response = await request(config.baseURL)
        .post('/locations/worker')
        .send({
            'LocationId': location.Id,
            'WorkerId': worker.Id})
        .set('Authorization', key.APIKey);
});

afterAll(()=>{
    let response = request(config.baseURL)
        .post('/workers/status/')
        .send({'WorkerId':worker.Id})
        .set('Authorization', key.APIKey)

    response = request(config.baseURL)
        .post('/locations/worker')
        .send({
            'LocationId': location.Id,
            'WorkerId': worker.Id})
        .set('Authorization', key.APIKey);
});

describe('Test GET Workers endpoints', ()=>{

    test('GET one Workers details', async()=>{

        const response = await request(config.baseURL)
            .get('/workers/'+entities.WorkerID)
            .set("Authorization", key.APIKey)

        expect(response.statusCode).toBe(200)
        expect(response.body).toMatchObject(worker)

        expect(response.body).toHaveProperty("Id");
        expect(response.body).toHaveProperty("FirstName");
        expect(response.body).toHaveProperty("LastName");
        expect(response.body).toHaveProperty("JobTitle");
        expect(response.body).toHaveProperty("EmployerId");
        expect(response.body).toHaveProperty("StreetAddress");
        expect(response.body).toHaveProperty("City");
        expect(response.body).toHaveProperty("PostalCode");
        expect(response.body).toHaveProperty("MobileNumber");
        expect(response.body).toHaveProperty("PhoneNumber");
        expect(response.body).toHaveProperty("DateHired");
        expect(response.body).toHaveProperty("EmployeeNumber");
        expect(response.body).toHaveProperty("EmergencyContact1");
        expect(response.body).toHaveProperty("EmergencyContact2");
        expect(response.body).toHaveProperty("EmergencyNotes");
        expect(response.body).toHaveProperty("PictureId");
        expect(response.body).toHaveProperty("Active");
        expect(response.body).toHaveProperty("CreatedOn");
        expect(response.body).toHaveProperty("LastModifiedOn");
        expect(response.body).toHaveProperty("Email");
        expect(response.body).toHaveProperty("IsExternal");
        expect(response.body).toHaveProperty("ContractorId");
        expect(response.body).toHaveProperty("ContractorName");
        expect(response.body).toHaveProperty("FullName");
    });

    test('GET unauthorized', async()=>{

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

    test('GET worker photo id', async()=>{

        const response = await request(config.baseURL)
            .get('/workers/photo/'+worker.Id)
            .set('Authorization', key.APIKey)

        expect(response.statusCode).toBe(200);
        expect(response.headers['content-type']).toBe("image/png");
        
    });

    test('GET a workers locations', async()=>{
        let response = await request(config.baseURL)
            .get('/workers/'+worker.Id+'/locations')
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(expect.any(Array));
        expect(response.body[0]).toMatchObject(location);

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

    test('GET unauthorized a Workers permission profile', async()=>{
        let response = await request(config.baseURL)
            .get('/workers/permissionProfile')
            .send(entities)
            .set('Authorization', 'thisIsAnInvalidAPIKey')
        
            expect(response.statusCode).toBe(401);

    });

    test('GET a Workers permission profile', async()=>{
        let response = await request(config.baseURL)
            .get('/workers/permissionProfile')
            .send(entities)
            .set('Authorization', key.APIKey)
        
        expect(response.statusCode).toBe(200);
        expect(response.body[0]).toHaveProperty('permissionProfileId');
        expect(response.body[0]).toHaveProperty('name');
        expect(response.body[0]).toHaveProperty('isDefault');
        expect(response.body[0]).toHaveProperty('listOfPermissions');
        expect(response.body[0]).toHaveProperty('profileType');
    });

});

describe('Test POST Worker endpoints', ()=>{

    test('POST unauthorized activate Worker', async()=>{
        let response = await request(config.baseURL)
            .post('/workers/status')
            .send({"WorkerId": worker.Id})
            .set('Authorization', 'thisIsAnInvalidAPIKey')
        
        expect(response.statusCode).toBe(401);
    });

    //Due to undefined error when activating an already active Worker,
    // POST/workers/status is tested in delete after deactivating a Worker
    /*
    test('POST activate Worker', async()=>{

        let response = request(config.baseURL)
            .post('/workers/status')
            .send({"WorkerId": worker.Id})
            .set('Authorization', key.APIKey);

        console.log(response.body);

        expect(response.statusCode).toBe(200);
    });
    */

});

describe('Test DELETE Worker endpoints', ()=>{
    
    test('DELETE unauthorized deactivate a worker', async()=>{

        const response = await request(config.baseURL)
            .delete('/workers/status')
            .send({"WorkerID": entities.WorkerID})
            .set('Authorization', 'thisIsAnInvalidAPIKey')

        expect(response.statusCode).toBe(401);
    });

    test('DELETE deactivate a worker', async()=>{

        let response = await request(config.baseURL)
            .delete('/workers/status')
            .send({'WorkerID': worker.Id})
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);

        response = await request(config.baseURL)
            .get('/workers/'+worker.Id)
            .set('Authorization', key.APIKey);
        
        expect(response.statusCode).toBe(200);
        expect(response.body.Active).toBe(false);

    });

    test('afterDELETE, reset Worker', async()=>{

        let response = await request(config.baseURL)
            .post('/workers/status')
            .send({'WorkerId': worker.Id})
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);

        response = await request(config.baseURL)
            .get('/workers/'+worker.Id)
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);
        expect(response.body.Active).toBe(true);

    });

});

describe('Test PUT Worker endpoints', ()=>{
    
    test('PUT unauthorized worker', async()=>{

        let response = await request(config.baseURL)
            .put('/workers')
            .send(workerPutOne)
            .auth('Authorization', 'thisIsAnInvalidAPIKey')

        expect(response.statusCode).toBe(401);
    });

    test('PUT a workers profile and validate update', async()=>{

        //Patch the Worker
        let response = await request(config.baseURL)
            .put('/workers')
            .send(workerPutOne)
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);

        //Get the patched value and check it was changed
        response = await request(config.baseURL)
            .get('/workers/'+worker.Id)
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);
        expect(response.body.EmergencyNotes).toBe('PUT - EMERGENCY NOTES');
        expect(response.body.FirstName).toBe('PUT - FIRST NAME');
        expect(response.body.LastName).toBe('PUT - LAST NAME');
        expect(response.body.JobTitle).toBe(null);
        expect(response.body.EmployerId).toBe('05e080fb-d67f-4f2e-9b16-d2ee7abea706');
        expect(response.body.StreetAddress).toBe(null);
        expect(response.body.City).toBe(null);
        expect(response.body.PostalCode).toBe(null);
        expect(response.body.MobileNumber).toBe(null);
        expect(response.body.PhoneNumber).toBe(null);
        expect(response.body.DateHired).toBe(null);
        expect(response.body.EmployeeNumber).toBe(null);
        expect(response.body.EmergencyContact1).toBe(null);
        expect(response.body.EmergencyContact2).toBe(null);
        expect(response.body.EmergencyNotes).toBe('PUT - EMERGENCY NOTES');
        expect(response.body.PictureId).toBe('b387c160-f9c6-4164-9706-027585355040');
        expect(response.body.Active).toBe(true);
        expect(response.body.CreatedOn).toBe('2025-05-26T21:55:51.543');
        expect(response.body.Email).toBe(null);
        expect(response.body.IsExternal).toBe(false);
        expect(response.body.ContractorId).toBe(null);
        expect(response.body.ContractorName).toBe(null);
        expect(response.body.FullName).toBe('PUT - FIRST NAME PUT - LAST NAME');
    });

    test('PUT a workers profile back and validate update', async()=>{

        //Patch them back
        let response = await request(config.baseURL)
            .put('/workers')
            .send(worker)
            .set('Authorization', key.APIKey)

        expect(response.statusCode).toBe(200);

        //Get the patched value and check it was changed
        response = await request(config.baseURL)
            .get('/workers/'+worker.Id)
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject(worker);

    });

    test('PUT all of a workers profile and validate update', async()=>{

        //PUT the Worker
        let response = await request(config.baseURL)
            .put('/workers')
            .send(workerPutAll)
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);

        //Get the put value and check it was changed
        response = await request(config.baseURL)
            .get('/workers/'+worker.Id)
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);
        expect(response.body.EmergencyNotes).toBe('PUT - EMERGENCY NOTES');
        expect(response.body.FirstName).toBe('PUT - FIRST NAME');
        expect(response.body.LastName).toBe('PUT - LAST NAME');
        expect(response.body.JobTitle).toBe('PUT - JOB TITLE');
        expect(response.body.EmployerId).toBe('05e080fb-d67f-4f2e-9b16-d2ee7abea706');
        expect(response.body.StreetAddress).toBe('PUT - STREET ADDRESS');
        expect(response.body.City).toBe('PUT - CITY');
        expect(response.body.PostalCode).toBe('PUT - POSTAL CODE');
        expect(response.body.MobileNumber).toBe('111-111-1111');
        expect(response.body.PhoneNumber).toBe('987-654-3210');
        expect(response.body.DateHired).toBe('2000-01-01T00:00:00');
        expect(response.body.EmployeeNumber).toBe('PUT - EMPLOYEE NUMBER');
        expect(response.body.EmergencyContact1).toBe('PUT - EMERGENCY CONTACT 1');
        expect(response.body.EmergencyContact2).toBe('PUT - EMERGENCY CONTACT 2');
        expect(response.body.EmergencyNotes).toBe('PUT - EMERGENCY NOTES');
        expect(response.body.PictureId).toBe('b387c160-f9c6-4164-9706-027585355040');
        expect(response.body.Active).toBe(true);
        expect(response.body.CreatedOn).toBe('2025-05-26T21:55:51.543');
        expect(response.body.Email).toBe('putapitesting@email.com');
        expect(response.body.IsExternal).toBe(false);
        expect(response.body.ContractorId).toBe(null);
        expect(response.body.ContractorName).toBe(null);
        expect(response.body.FullName).toBe('PUT - FIRST NAME PUT - LAST NAME');
    });

    test('PUT a workers profile back and validate update', async()=>{

        //Patch them back
        let response = await request(config.baseURL)
            .put('/workers')
            .send(worker)
            .set('Authorization', key.APIKey)

        expect(response.statusCode).toBe(200);

        //Get the patched value and check it was changed
        response = await request(config.baseURL)
            .get('/workers/'+worker.Id)
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject(worker);

    });
});

describe('Test PATCH Worker endpoints', ()=>{

    test('PATCH unauthorized', async()=>{
        let response = await request(config.baseURL)
            .patch('/workers')
            .send(workerPatchOne)
            .set('Authorization', 'thisIsAnInvalidAPIKey')

        expect(response.statusCode).toBe(401);
    });

    test('PATCH a workers profile and validate update', async()=>{

        //Patch the Worker
        let response = await request(config.baseURL)
            .patch('/workers')
            .send(workerPatchOne)
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);

        //Get the patched value and check it was changed
        response = await request(config.baseURL)
            .get('/workers/'+worker.Id)
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);
        expect(response.body.EmergencyNotes).toBe('PATCH - EMERGENCY NOTES');
    });

    test('PATCH a worker back and validate update', async()=>{

        //Patch them back
        let response = await request(config.baseURL)
            .patch('/workers')
            .send(worker)
            .set('Authorization', key.APIKey)

        expect(response.statusCode).toBe(200);

        //Get the patched value and check it was changed
        response = await request(config.baseURL)
            .get('/workers/'+worker.Id)
            .set('Authorization', key.APIKey);

        expect(response.body).toHaveProperty("EmergencyNotes");
        expect(response.body.EmergencyNotes).toBe("FOR API TESTING - EMERGENCY NOTES");
    });

    test('PATCH all of a workers details and validate update', async()=>{

        //Patch the Worker
        let response = await request(config.baseURL)
            .patch('/workers')
            .send(workerPatchAll)
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);

        //Get the patched value and check it was changed
        response = await request(config.baseURL)
            .get('/workers/'+worker.Id)
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject(workerPatchAll);
    });

    test('PATCH all of a workers details back and validate update', async()=>{

        //Patch them back
        let response = await request(config.baseURL)
            .patch('/workers')
            .send(worker)
            .set('Authorization', key.APIKey)

        expect(response.statusCode).toBe(200);

        //Get the patched value and check it was changed
        response = await request(config.baseURL)
            .get('/workers/'+worker.Id)
            .set('Authorization', key.APIKey);

        expect(response.body).toHaveProperty("EmergencyNotes");
        expect(response.body).toMatchObject(worker);
    });

    //No current method of knowing the permission profile of a Worker
    test.skip('PATCH a workers profile', async()=>{
        let response = await request(config.baseURL)
            .patch('/workers/permissionProfile')
            .send({"PermissionProfileId": "169ed181-5f99-4560-a06d-5fcb003e724b",
                "MembersToAssign": [
                    worker.Id
                ],
                "ProfileType": "App"
            })
            .set('Authorization', key.APIKey);
        
        response = await request(config.baseURL)
            .get('/workers/'+worker.Id)
            .set('Authorization', key.APIKey);

    });

});