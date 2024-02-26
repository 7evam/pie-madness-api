const express = require("express");
const router = express.Router();
const { createComment, getCommentById, deleteCommentById, getCommentsByPostId } = require("./comments.service");
const { authenticateUser } = require("../users/users.service");
const {
  validateRequiredPostFields,
  handleError,
} = require("../../utils/requestHelper");
const { getPostById } = require("../posts/posts.service");
const { createNotification } = require("../notifications/notifications.service");

// create commment
router.post("/posts/:postId/comments", async (req, res, next) => {
  const { postId } = req.params;
  const { body } = req;

  const validationErrors = validateRequiredPostFields(
    {
      postId: {
        required: true,
        notEmpty: true,
      },
      comment: {
        required: true,
        notEmpty: true,
      },
      userId: {
        required: true,
        notEmpty: true,
      },
      secret: {
        required: true,
        notEmpty: true,
      },
    },
    body
  );

  if (validationErrors.error) {
    res.status(400).json(validationErrors);
    return;
  }

  const isValid = await authenticateUser(body.userId, body.secret);

  if (!isValid) {
    res.status(401).json({ error: "Unauthorized" });
    return
  }

  const comment = await createComment(postId, body);

  // get users for notifications
  // get user from post
  const year = postId.split('-')[0]
  if (year.length !== 4) {
    // TODO dont throw error just warning
    res.status(400).json({ error: "Unable to retrieve post without year" })
    return
  }
  const post = await getPostById(year, postId)

  // and all users from commments
  const comments = await getCommentsByPostId(postId)

  // create notification for every user that has comment on post
  // only if their notification settings are on

  // use hash table for constant time lookup
  const userTable = { [post.user]: null }
  comments.forEach(comment => {
    if (!userTable[comment.user.split('#')[1]]) userTable[comment.user.split('#')[1]] = null
  })

  for (let user of Object.keys(userTable)) {
    await createNotification(postId, post.title, user)
  }


  res.status(201).json(comment);
});

// delete comment
router.delete("/posts/:postId/comments/:commentId", async (req, res, next) => {
  const { postId, commentId } = req.params;
  const secret = req.headers.authorization
  if (!secret.length) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  const comment = await getCommentById(postId, commentId)

  const userId = comment.user.split('#')[1]

  const isValid = await authenticateUser(userId, secret)

  if (!isValid) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  await deleteCommentById(postId, commentId)

  res.status(200).json("successfully deleted comment")
})

module.exports = router;
