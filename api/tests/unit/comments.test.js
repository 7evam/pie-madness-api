const { expect } = require('chai');
const chai = require('chai')
const chaiHttp = require('chai-http')
const sinon = require('sinon')

const lambda = require("../../lambda");

chai.use(chaiHttp)

// post comment
describe('integration, puts post', () => {
    it('receive 201 for creating comment', async () => {
        const body = {
            "postId": "9d62953f-99e4-4abd-8f4f-f261cdd49016",
            "comment": "Apple pie is good but there's so much else out there!",
            "userId": "da6404a0-d32c-4e05-8377-319c274c3254",
            "secret": "61b540c8-ddd7-f213-8088-26c645e96eb7"
        }
        const body_b64 = Buffer.from(JSON.stringify(body)).toString('base64')
        const event = {
            body: body_b64,
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                'Content-Length': body_b64.length,
            },
            requestContext: {
                stage: 'dev'
            },
            httpMethod: 'POST',
            path: '/posts/9d62953f-99e4-4abd-8f4f-f261cdd49016/comments',
            pathParameters: { proxy: '/posts/9d62953f-99e4-4abd-8f4f-f261cdd49016/comments' },
            isBase64Encoded: true
        }
        const result = await lambda.handler(event, {})
        expect(result.statusCode).to.equal(201);
    })
})
// describe('integration, puts comment', () => {
//     it('should create a new comment', async () => {


//         const putToDatabaseStub = sinon.stub().resolves(testComment);

//         const originalPutToDatabase = require('../../routes/comments/comments.service').putToDatabase;
//         require('../../routes/comments/comments.service').putToDatabase = putToDatabaseStub;

//         const params = {
//             postId: 'unique_post_id',
//             text: 'Post text',
//             title: 'Post Title',
//             image: 'post_image_url',
//             time: new Date(),
//             userId: 'user_id',
//             hasPoll: false,
//             pollId: null,
//             pollTitle: null
//         }

//         const result = await createPost(2023, params);

//         require('../../routes/posts/posts.service').putToDatabase = originalPutToDatabase;

//         expect(result).to.deep.equal(testPost);
//         expect(putToDatabaseStub.calledOnce).to.be.true;
//         expect(putToDatabaseStub.firstCall.args[0]).to.deep.equal({
//             TableName: 'pie_madness_local',
//             Item: {
//                 PK: 'POST#CONTEST#2023',
//                 SK: 'unique_post_id',
//                 text: 'Post text',
//                 title: 'Post Title',
//                 image: 'post_image_url',
//                 timestamp: params.time,
//                 user: 'user_id',
//                 hasPoll: false,
//                 poll: null,
//                 number: 0,
//                 pollTitle: null
//             }
//         });
//     });
// });
// delete comment