const express = require("express");
const router = express.Router();
const { createComment } = require("./comments.service");
const { authenticateUser } = require("../users/users.service");
const {
  validateRequiredPostFields,
  handleError,
} = require("../../utils/requestHelper");

const crypto = require("crypto");

router.post("/posts/:postId/comments", async (req, res) => {
  const { postId } = req.params;
  const { body } = req;

  const validationErrors = validateRequiredPostFields(
    {
      postId: {
        required: true,
        notEmpty: true,
      },
      text: {
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
    const uuid = crypto.randomUUID();
    const post = await createComment(postId, uuid, body);
    handleError(res, post);
    res.status(201).json(post);
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

module.exports = router;
