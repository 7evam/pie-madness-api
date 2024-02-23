const { expect } = require('chai');
const chai = require('chai')
const chaiHttp = require('chai-http')
const sinon = require('sinon')

const lambda = require("../../lambda");
const { getUserInfo } = require("../../routes/users/users.service")
chai.use(chaiHttp)

// get user
describe('integration, gets user', () => {
    it('should show user without secret and get 200 code', async () => {
        const testUser = {
            image: 'https://pie-madness.s3.amazonaws.com/d7f5eea1-5af6-4982-bccc-0e7e870b0215.jpeg',
            lastName: 'lane',
            firstName: 'evan',
            favoritePie: '',
            SK: 'USER#da6404a0-d32c-4e05-8377-319c274c3254',
            PK: 'USER#da6404a0-d32c-4e05-8377-319c274c3254',
            user: 'evan lane',
            timestamp: 1678082527781
        }
        const userId = "da6404a0-d32c-4e05-8377-319c274c3254"
        const event = {
            headers: {},
            httpMethod: 'GET',
            path: `/users/${userId}`,
            requestContext: {
                stage: 'dev'
            }
        }
        const result = await lambda.handler(event, {})
        expect(result.statusCode).to.equal(200);
        // const res = await getUserInfo(userId)
        // expect(res).to.deep.equal(testUser)
    })
})

// create or update user
// describe('service creates user', () => {
//     it('should create user', async () => {
//         const newUser = {
//             image: 'test',
//             name: 'test',
//             userId: 'testUser'
//         }
//     })
// })

// edit notification settings

// get notification setting

// import profile