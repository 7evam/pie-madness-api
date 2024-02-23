
const { dynamodb, TableName } = require('../../services/db')
const error = require('../../services/error')
const { QueryCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require('@aws-sdk/util-dynamodb');
// const {sortByTime} = require('./util/sortByTime')
const { PutCommand, DynamoDBDocumentClient, DeleteCommand } = require('@aws-sdk/lib-dynamodb')
const crypto = require("crypto");

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

exports.deletePostById = async (year, postId) => {
    const params = {
        TableName,
        Key: {
            PK: `POST#CONTEST#${year}`,
            SK: `POST#${postId}`
        }
    }
    const response = await this.deleteFromDatabase(params)

    return response
}

exports.getPostById = async (year, postId) => {
    const params = {
        TableName,
        KeyConditionExpression: 'PK = :ContestId AND SK = :PostId',
        ExpressionAttributeValues: {
            ':ContestId': { S: `POST#CONTEST#${year}` },
            ':PostId': { S: `POST#${postId}` }
        }
    }
    const post = await this.getFromDatabase(params)
    if (post.length === 0) throw new error.NotFound(`post with id ${postId} not found`)
    if (post.length > 1) throw new error.ServerError(`multiple posts with id ${postId} found`)
    return post[0]
}

exports.updatePost = async (contestId, params, postId) => {
    const updatedPost = {
        TableName,
        Item: {
            PK: `POST#CONTEST#${contestId}`,
            SK: `POST#${contestId}-${postId}`,
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
    await this.putToDatabase(updatedPost)
    return { postId, ...params }
}

exports.createPost = async (contestId, params) => {
    const postId = `${contestId}-${crypto.randomUUID()}`
    params.postId = postId
    const newPost = {
        TableName,
        Item: {
            PK: `POST#CONTEST#${contestId}`,
            SK: `POST#${postId}`,
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
    await this.putToDatabase(newPost)
    return params
}

exports.deleteFromDatabase = async (params) => {
    try {
        const command = new DeleteCommand(params)
        const docClient = DynamoDBDocumentClient.from(dynamodb)
        const response = await docClient.send(command)
        return response
    } catch (e) {
        console.error(e)
        throw new error.ServerError('unable to delete post from database')
    }

}