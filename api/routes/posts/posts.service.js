
const { dynamodb, TableName } = require('../../services/db')
// const {sortByTime} = require('./util/sortByTime')

exports.getPostsByContestId = async (year) => {
    const params = {
        TableName,
        KeyConditionExpression: 'PK = :ContestId',
        ExpressionAttributeValues: {
            ':ContestId': `POST#CONTEST#${year}`
        }
    }

    const posts = await this.getFromDatabase(params)

    return posts
};

exports.getFromDatabase = async (params) => {
    try {
        const dbRes = await dynamodb.query(params).promise()
        return dbRes.Items
    } catch (err) {
        console.error('failed to get posts by contest ID')
        console.log(err)
    }
}

exports.putToDatabase = async (params) => {
    try {
        res = await dynamodb.put(newPost).promise()
        return newPost
    } catch (e) {
        console.error('failed to create post')
        return { error: 'failed to create post' }
        // TODO
        // write error sending function
    }
}

exports.createPost = async (contestId, params) => {
    const newPost = {
        TableName,
        Item: {
            PK: `POST#CONTEST#${contestId}`,
            SK: params.postId,
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