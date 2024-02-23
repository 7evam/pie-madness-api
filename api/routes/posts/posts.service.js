
const { dynamodb, TableName } = require('../../services/db')
const error = require('../../services/error')
const { QueryCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require('@aws-sdk/util-dynamodb');
// const {sortByTime} = require('./util/sortByTime')
const { PutCommand, DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb')

exports.getPostsByContestId = async (year) => {
    const params = {
        TableName,
        KeyConditionExpression: 'PK = :ContestId',
        ExpressionAttributeValues: {
            ':ContestId': { S: `POST#CONTEST#${year}` }
        }
    }

    const posts = await this.getFromDatabase(params)

    return posts
};

// exports.getFromDatabase = async (params) => {
//     try {
//         const docClient = DynamoDBDocumentClient.from(dynamodb)
//         const res = await docClient.get(params)
//         return res
//     } catch (e) {
//         console.error(e)
//         throw new error.ServerError('failed to get from database')
//     }
// }

exports.getFromDatabase = async (params) => {
    console.log("getting from database hers params")
    console.log(params)
    try {
        const query = new QueryCommand(params)
        const result = await dynamodb.send(query)
        return result.Items?.map(item => unmarshall(item))
    } catch (err) {
        console.error('failed to get data from database')
        console.error(err)
        throw new error.ServerError('unable to fetch from database')
    }
}

exports.putToDatabase = async (params) => {
    try {
        const docClient = DynamoDBDocumentClient.from(dynamodb)
        const query = new PutCommand(params)
        const res = await docClient.send(query)
        return res
    } catch (e) {
        console.error(e)
        throw new error.ServerError('failed to put to database')
    }
}

exports.getPostById = async (year, postId) => {
    const params = {
        TableName,
        KeyConditionExpression: 'PK = :ContestId AND SK = :PostId',
        ExpressionAttributeValues: {
            ':ContestId': { S: `POST#CONTEST#${year}` },
            ':PostId': { S: postId }
        }
    }
    const post = await this.getFromDatabase(params)
    console.log('here is post')
    console.log(post)
    if (post.length === 0) throw new error.NotFound(`post with id ${postId} not found`)
    if (post.length > 1) throw new error.ServerError(`multiple posts with id ${postId} found`)
    return post[0]
}

exports.createPost = async (contestId, params) => {
    const newPost = {
        TableName,
        Item: {
            PK: `POST#CONTEST#${contestId}`,
            SK: `${contestId}-${params.postId}`,
            text: params.text,
            title: params.title,
            image: params.image,
            timestamp: params.time,
            user: params.userId,
            hasPoll: params.hasPoll,
            poll: params.pollId,
            // number is number of comments, init at 0
            number: 0,
            pollTitle: params.pollTitle
        }
    }
    const res = await this.putToDatabase(newPost)
    return res
}