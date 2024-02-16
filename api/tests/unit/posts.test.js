const { expect } = require('chai');
const chai = require('chai')
const chaiHttp = require('chai-http')

const lambda = require("../../lambda")

chai.use(chaiHttp)

describe('handler', () => {
    it('GET posts with 200', async () => {
        const event = {
            headers: {},
            httpMethod: 'GET',
            path: '/posts/contestId/2023',
            requestContext: {
                stage: 'dev'
            }
        }
        const result = await lambda.handler(event, {})
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.have.lengthOf.at.least(5);
    });
});