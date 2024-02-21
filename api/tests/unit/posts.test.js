const { expect } = require('chai');
const chai = require('chai')
const chaiHttp = require('chai-http')
const sinon = require('sinon')

const lambda = require("../../lambda");
const { getPostsByContestId, createPost } = require('../../routes/posts/posts.service');

chai.use(chaiHttp)

describe('handler', () => {
    it('should GET posts with 200', async () => {
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

describe('servce gets posts', () => {
    it('should show the service can get posts', async () => {
        const testPost = {
            "SK": "123455678910123",
            "number": 0,
            "PK": "POST#CONTEST#2023",
            "text": "This is a test",
            "title": "Test"
        }
        const getFromDatabaseStub = sinon.stub().resolves([testPost])
        const originalGetFromDatabase = require('../../routes/posts/posts.service').getFromDatabase
        require('../../routes/posts/posts.service').getFromDatabase = getFromDatabaseStub
        const result = await getPostsByContestId(2023)
        require('../../routes/posts/posts.service').getFromDatabase = originalGetFromDatabase

        expect(result).to.deep.equal([testPost]);
        expect(getFromDatabaseStub.calledOnce).to.be.true
        expect(getFromDatabaseStub.firstCall.args[0]).to.deep.equal({
            TableName: 'pie_madness_local',
            KeyConditionExpression: 'PK = :ContestId',
            ExpressionAttributeValues: { ':ContestId': 'POST#CONTEST#2023' }
        })
    })
})

describe('createPost', () => {
    it('should create a new post', async () => {
        const testPost = {
            "SK": "123455678910123",
            "number": 0,
            "PK": "POST#CONTEST#2023",
            "text": "This is a test",
            "title": "Test"
        }
        const putToDatabaseStub = sinon.stub().resolves(testPost);

        const originalPutToDatabase = require('../../routes/posts/posts.service').putToDatabase;
        require('../../routes/posts/posts.service').putToDatabase = putToDatabaseStub;

        const params = {
            postId: 'unique_post_id',
            text: 'Post text',
            title: 'Post Title',
            image: 'post_image_url',
            time: new Date(),
            userId: 'user_id',
            hasPoll: false,
            pollId: null,
            pollTitle: null
        }

        const result = await createPost(2023, params);

        require('../../routes/posts/posts.service').putToDatabase = originalPutToDatabase;

        expect(result).to.deep.equal(testPost);
        expect(putToDatabaseStub.calledOnce).to.be.true;
        expect(putToDatabaseStub.firstCall.args[0]).to.deep.equal({
            TableName: 'pie_madness_local',
            Item: {
                PK: 'POST#CONTEST#2023',
                SK: 'unique_post_id',
                text: 'Post text',
                title: 'Post Title',
                image: 'post_image_url',
                timestamp: params.time,
                user: 'user_id',
                hasPoll: false,
                poll: null,
                number: 0,
                pollTitle: null
            }
        });
    });
});