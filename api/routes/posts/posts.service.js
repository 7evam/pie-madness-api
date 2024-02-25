
const { dynamodb, TableName } = require('../../services/db')
const error = require('../../services/error')
const { QueryCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require('@aws-sdk/util-dynamodb');
// const {sortByTime} = require('./util/sortByTime')
const { DynamoDBDocumentClient, DeleteCommand, UpdateCommand, PutCommand } = require('@aws-sdk/lib-dynamodb')
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

const generateUpdateParams = (updateValues) => {
    let UpdateExpression = "SET ";
    const ExpressionAttributeNames = {};
    const ExpressionAttributeValues = {};

    Object.keys(updateValues).forEach((key, index) => {
        const attributeName = `#attr${index}`;
        const attributeValueKey = `:val${index}`;
        UpdateExpression += `${attributeName} = ${attributeValueKey}, `;
        ExpressionAttributeNames[attributeName] = key;
        ExpressionAttributeValues[attributeValueKey] = updateValues[key];
    });

    // Remove trailing comma and space
    UpdateExpression = UpdateExpression.slice(0, -2);

    return {
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
    };
}

exports.updatePost = async (contestId, params, postId) => {
    const {
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues
    } = generateUpdateParams(params)

    const updatedPost = {
        TableName,
        Key: {
            PK: `POST#CONTEST#${contestId}`,
            SK: `POST#${postId}`
        },
        UpdateExpression,
        ExpressionAttributeValues,
        ExpressionAttributeNames,
        "ReturnValues": "ALL_NEW",
    }
    await this.updateDatabase(updatedPost)
    return { postId, ...params }
}

// exports.updatePost = async (contestId, params, postId) => {
//     const updatedPost = {
//         TableName,
//         Item: {
//             text: params.text,
//             title: params.title,
//             image: params.image,
//             // number is number of comments, init at 0
//             number: 0,
//             pollTitle: params.pollTitle,
//             pollOptions: params.pollOptions
//         }
//     }
//     await this.putToDatabase(updatedPost)
//     return { postId, ...params }
// }

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
            // number is number of comments, init at 0
            number: 0,
            pollTitle: params.pollTitle,
            pollOptions: params.pollOptions,
            pollVotes: params.pollVotes
        }
    }
    await this.putToDatabase(newPost)
    return params
}

// Database functions

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

exports.updateDatabase = async (params) => {
    try {
        const docClient = DynamoDBDocumentClient.from(dynamodb)
        const query = new UpdateCommand(params)
        const res = await docClient.send(query)
        return res
    } catch (e) {
        console.error(e)
        throw new error.ServerError('failed to put to database')
    }
}