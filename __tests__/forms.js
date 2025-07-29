const request = require('supertest');
const config = require('../Configuration/config.json');
const key = require('../Configuration/apikey.json');
const form = require('../Configuration/Forms/form.json');
const formContent = require('../Configuration/Forms/formContent.json');

const { EventEmitterAsyncResource } = require('supertest/lib/test');

describe('GET', ()=>{
    test('a Form by its ID', async()=>{
        let response = await request(config.baseURL)
            .get('/forms/'+form.Id)
            .set('Authorization', key.APIKey);

        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject(form);

        expect(response.body).toHaveProperty("Id");
        expect(response.body).toHaveProperty("Label");
        expect(response.body).toHaveProperty("CreatedOn");
        expect(response.body).toHaveProperty("CreatedBy");
        expect(response.body).toHaveProperty("IsDeleted");
        expect(response.body).toHaveProperty("DocumentId");
        expect(response.body).toHaveProperty("DocumentTemplateVersionId");
        expect(response.body).toHaveProperty("DocumentTemplateId");
        expect(response.body).toHaveProperty("HasGoodData");
        expect(response.body).toHaveProperty("PrecedingVersionId");
        expect(response.body).toHaveProperty("Due");
        expect(response.body).toHaveProperty("IsPrivate");
        expect(response.body).toHaveProperty("CreatingCompanyId");
        expect(response.body).toHaveProperty("LocationId");
        expect(response.body).toHaveProperty("DocumentTemplateName");
        expect(response.body).toHaveProperty("Type");
        expect(response.body).toHaveProperty("FormScheduleGroupId");
        expect(response.body).toHaveProperty("ProcessRunId");
        expect(response.body).toHaveProperty("ProcessDefinitionId");
    });

    test('invalid when unauthorized', async()=>{
        let response = await request(config.baseURL)
            .get('/forms/'+form.Id)
            .set('Authorization', 'thisIsAnInvalidAPIKey');

        expect(response.statusCode).toBe(401);
    });

    test('a message when invalid FormID', async()=>{
        let response = await request(config.baseURL)
            .get('/forms/'+'invalidFormID')
            .set('Authorization', key.APIKey);
        
        expect(response.body.Message).toBe("No HTTP resource was found that matches the request URI 'https://api-1.sitedocs.com/api/v1/forms/invalidFormID'.");
    });

    test('a Forms Content', async()=>{
        let response = await request(config.baseURL)
            .get('/forms/content/'+form.Id)
            .set('Authorization', key.APIKey);
        
        expect(response.body).toStrictEqual(formContent);
    });

    test('Search for 5 Forms by type ID', async()=>{
        let response = await request(config.baseURL)
            .get('/forms'+'?count=5&formTypeId='+form.DocumentTemplateId)
            .set('Authorization', key.APIKey)

        expect(response.body.length).toBe(5);
    });

    test('Search for 100 Forms by type ID and verify type ID', async()=>{
        let response = await request(config.baseURL)
            .get('/forms'+'?count=100&formTypeId='+form.DocumentTemplateId)
            .set('Authorization', key.APIKey);
        
        for(const form of response.body){
            expect(form.DocumentTemplateId).toBe(form.DocumentTemplateId);
        }
    });

    test.todo('perform failing tests on search parameters for Forms')
});