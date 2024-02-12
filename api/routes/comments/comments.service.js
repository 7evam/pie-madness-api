const { dynamodb, TableName } = require("../../services/db");

exports.createComment = async (postId, commentId, params) => {
  const newComment = {
    TableName,
    Item: {
      PK: `POST#${postId}`,
      SK: `COMMENT#${commentId}`,
      text: params.text,
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
