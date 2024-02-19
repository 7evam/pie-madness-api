const { dynamodb, TableName } = require("../../services/db");
const crypto = require("crypto");

exports.createComment = async (postId, params) => {
  const commentId = crypto.randomUUID();

  const newComment = {
    TableName,
    Item: {
      PK: `POST#${postId}`,
      SK: `COMMENT#${commentId}`,
      text: params.comment,
      timestamp: params.time,
      user: `USER#${params.userId}`,
    },
  };

  let res;
  try {
    res = await dynamodb.put(newComment).promise();
    return newComment;
  } catch (e) {
    console.error("failed to create comment");
    return { error: "failed to create comment" };
  }
};
