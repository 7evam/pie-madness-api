const express = require("express");
const router = express.Router();
const { createComment, getCommentById, deleteCommentById } = require("./comments.service");
const { authenticateUser } = require("../users/users.service");
const {
  validateRequiredPostFields,
  handleError,
} = require("../../utils/requestHelper");

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

  if (isValid) {
    const post = await createComment(postId, body);
    handleError(res, post);
    res.status(201).json(post);
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

// delete comment
router.delete("/posts/:postId/comments/:commentId", async (req, res, next) => {
  const { postId, commentId } = req.params;
  const secret = req.headers.authorization

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
