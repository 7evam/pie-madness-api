const express = require('express')
const router = express.Router()
const { updatePost, getPostsByContestId, createPost, getPostById, deletePostById } = require('./posts.service')
const { authenticateUser, getUserInfo } = require('../users/users.service')
const { validateRequiredPostFields, handleError } = require('../../utils/requestHelper')
const { getCommentsByPostId } = require('../comments/comments.service')

// get posts by contest id
router.get("/posts/contestId/:contestId", async (req, res, next) => {
    try {
        const { contestId } = req.params

        // get posts
        const posts = await getPostsByContestId(contestId)

        // create array of users needed to fetch
        const users = []
        for (const post of posts) {
            let user = post.user
            if (user && user.includes('USER#')) user = user.split('#')[1]
            if (!(users.includes(user))) {
                users.push(user)
            }
        }

        // get data for each user
        const userTable = {}
        for (let user of users) {
            userTable[user] = await getUserInfo(user)
        }

        // append user info on each post
        posts.forEach(post => {
            post.user = userTable[post.user]
        })

        res.status(200).json(posts)
    } catch (err) {
        next(err)
    }
});

// get post by id
router.get("/posts/:postId", async (req, res, next) => {
    try {
        const { postId } = req.params

        // if post doesn't have year in id 
        // the post is unable to be retreived
        const year = postId.split('-')[0]
        if (year.length !== 4) {
            res.status(400).json({ error: "Unable to retrieve post without year" })
            return
        }

        // get post
        const post = await getPostById(year, postId)

        // get comments

        const comments = await getCommentsByPostId(postId)


        // create array of users needed to fetch
        // start with user from post

        const users = [post.user]
        for (const comment of comments) {
            if (!(users.includes(comment.user))) {
                users.push(comment.user.split('#')[1])
            }
        }

        // get data for each user
        const userTable = {}
        for (let user of users) {
            userTable[user] = await getUserInfo(user)
        }

        // append user info on post and each comment
        post.user = userTable[post.user]
        comments.forEach(comment => {
            comment.user = userTable[comment.user.split('#')[1]]
        })
        post.comments = comments
        res.status(200).json(post)
    } catch (err) {
        next(err)
    }
})

// create post
router.post('/posts/contestId/:contestId', async (req, res, next) => {
    try {
        const { contestId } = req.params
        const { body } = req

        const validationErrors = validateRequiredPostFields({
            'text': {
                required: true,
                notEmpty: true
            },
            'title': {
                required: true,
                notEmpty: true
            },
            'userId': {
                required: true,
                notEmpty: true
            },
            'secret': {
                required: true,
                notEmpty: true
            },
            'pollTitle': {
                required: false
            },
            // TODO validate that pollOptions is an array
            'pollOptions': {
                required: body.pollTitle ? true : false,
                notEmpty: body.pollTitle ? true : false,
                type: body.pollTitle ? 'array' : null
            }
        }, body)

        if (body.pollOptions) body.pollVotes = Array.from({ length: body.pollOptions.length }, () => []);

        if (validationErrors.error) {
            res.status(400).json(validationErrors)
            return
        }

        const isValid = await authenticateUser(body.userId, body.secret)
        delete body.secret
        // TODO
        // await createNotificationSetting()

        if (isValid) {
            const post = await createPost(contestId, body)
            handleError(res, post)
            res.status(201).json(post)
        } else {
            res.status(401).json({ error: 'Unauthorized' })
        }
    } catch (e) {
        next(e)
    }
})

// delete post
router.delete('/posts/:postId', async (req, res, next) => {
    const { postId } = req.params;
    const secret = req.headers.authorization
    if (!secret.length) {
        res.status(401).json({ error: "Unauthorized" })
        return
    }

    // if post doesn't have year in id 
    // the post is unable to be retreived
    const year = postId.split('-')[0]
    if (year.length !== 4) {
        res.status(400).json({ error: "Unable to retrieve post without year" })
        return
    }

    const post = await getPostById(year, postId)

    const isValid = await authenticateUser(post.user, secret)

    if (!isValid) {
        res.status(401).json({ error: "Unauthorized" })
        return
    }

    // TODO
    // consider deleting all comments associated with post

    await deletePostById(year, postId)

    res.status(200).json("successfully deleted post")
})

// edit post
router.patch('/posts/:postId', async (req, res, next) => {
    try {
        const { body } = req
        const { postId } = req.params

        // if post doesn't have year in id 
        // the post is unable to be retreived
        const year = postId.split('-')[0]
        if (year.length !== 4) {
            res.status(400).json({ error: "Unable to retrieve post without year" })
            return
        }

        const validationErrors = validateRequiredPostFields({
            'text': {
                required: true,
                notEmpty: true
            },
            'title': {
                required: true,
                notEmpty: true
            },
            'userId': {
                required: true,
                notEmpty: true
            },
            'secret': {
                required: true,
                notEmpty: true
            },
            'pollTitle': {
                required: false
            },
            'pollOptions': {
                required: body.pollTitle ? true : false,
                notEmpty: body.pollTitle ? true : false
            },
            'pollVotes': {
                required: false
            }
        }, body)

        if (validationErrors.error) {
            res.status(400).json(validationErrors)
            return
        }

        const isValid = await authenticateUser(body.userId, body.secret)
        delete body.secret
        // TODO
        // await createNotificationSetting()

        if (isValid) {
            const post = await updatePost(year, body, postId)
            // handleError(res, post)
            res.status(201).json(post)
        } else {
            res.status(401).json({ error: 'Unauthorized' })
        }
    } catch (e) {
        next(e)
    }
})

// add vote to poll option
router.patch('/posts/:postId/addVote', async (req, res, next) => {
    try {
        const { body } = req
        const { postId } = req.params

        // if post doesn't have year in id 
        // the post is unable to be retreived
        const year = postId.split('-')[0]
        if (year.length !== 4) {
            res.status(400).json({ error: "Unable to retrieve post without year" })
            return
        }

        const validationErrors = validateRequiredPostFields({
            'userId': {
                // user id of voter
                required: true,
                notEmpty: true
            },
            'secret': {
                required: true,
                notEmpty: true
            },
            'pollOption': {
                // 0 indexed option of poll option to vote for
                required: true,
                notEmpty: true,
                type: "number"
            }
        }, body)

        if (validationErrors.error) {
            res.status(400).json(validationErrors)
            return
        }

        const isValid = await authenticateUser(body.userId, body.secret)
        delete body.secret

        if (!isValid) res.status(401).json({ error: 'Unauthorized' })

        // fetch post
        const post = await getPostById(year, postId)

        // check that user hasn't voted in this poll before
        const hasUserVoted = post.pollVotes.some(subArray => subArray.includes(body.userId));
        if (hasUserVoted) {
            res.status(400).json("User has already voted")
            return
        }
        const newPollVotes = post.pollVotes
        if (!newPollVotes[body.pollOption]) res.status(404).json({ error: "Poll option not found" })
        newPollVotes[body.pollOption].push(body.userId)
        const params = {
            pollVotes: newPollVotes
        }



        const response = await updatePost(year, params, postId)
        handleError(res, post)
        res.status(201).json(post)
    } catch (e) {
        next(e)
    }
})

// remove vote to poll option
// TODO consider combining this with add vote since most code is the same
// use addVote/removeVote as param
router.patch('/posts/:postId/removeVote', async (req, res, next) => {
    try {
        const { body } = req
        const { postId } = req.params

        // if post doesn't have year in id 
        // the post is unable to be retreived
        const year = postId.split('-')[0]
        if (year.length !== 4) {
            res.status(400).json({ error: "Unable to retrieve post without year" })
            return
        }

        const validationErrors = validateRequiredPostFields({
            'userId': {
                // user id of voter
                required: true,
                notEmpty: true
            },
            'secret': {
                required: true,
                notEmpty: true
            },
            'pollOption': {
                // 0 indexed option of poll option to remove vote for
                required: true,
                notEmpty: true,
                type: "number"
            }
        }, body)

        if (validationErrors.error) {
            res.status(400).json(validationErrors)
            return
        }

        const isValid = await authenticateUser(body.userId, body.secret)
        delete body.secret

        if (!isValid) res.status(401).json({ error: 'Unauthorized' })

        // fetch post
        const post = await getPostById(year, postId)

        // check that user has indeed voted in this poll before
        const hasUserVoted = post.pollVotes.some(subArray => subArray.includes(body.userId));
        if (!hasUserVoted) {
            res.status(400).json("Can't remove vote, user hasn't voted in this poll")
            return
        }

        let newPollVotes = post.pollVotes
        if (!newPollVotes[body.pollOption]) res.status(404).json({ error: "Poll option not found" })

        const voteIndex = newPollVotes[body.pollOption].indexOf(body.userId)

        if (voteIndex < 0) {
            res.status(400).json({ error: "vote from user not found" })
            return
        }

        newPollVotes[body.pollOption].splice(voteIndex, 1)
        const params = {
            pollVotes: newPollVotes
        }

        const response = await updatePost(year, params, postId)
        handleError(res, post)
        res.status(201).json(post)
    } catch (e) {
        next(e)
    }
})

// legacy get post by id
router.get("/posts/:postId/year/:year", async (req, res, next) => {
    try {
        const { postId, year } = req.params

        // get post
        const post = await getPostById(year, postId)

        // get comments
        const comments = await getCommentsByPostId(postId)

        // create array of users needed to fetch
        // start with user from post
        const users = [post.user]
        for (const comment of comments) {
            if (!(users.includes(comment.user))) {
                users.push(comment.user)
            }
        }

        // get data for each user
        const userTable = {}
        for (let user of users) {
            userTable[user] = await getUserInfo(user)
        }

        // append user info on post and each comment
        post.user = userTable[`USER#${post.user}`]
        comments.forEach(comment => {
            comment.user = userTable[comment.user]
        })
        post.comments = comments
        res.status(200).json(post)
    } catch (err) {
        next(err)
    }
})

// legacy edit post
router.put('/posts/:postId/year/:year', async (req, res, next) => {
    try {
        const { body } = req
        const { postId, year } = req.params

        const validationErrors = validateRequiredPostFields({
            'text': {
                required: true,
                notEmpty: true
            },
            'title': {
                required: true,
                notEmpty: true
            },
            'userId': {
                required: true,
                notEmpty: true
            },
            'secret': {
                required: true,
                notEmpty: true
            }
        }, body)

        if (validationErrors.error) {
            res.status(400).json(validationErrors)
            return
        }

        const isValid = await authenticateUser(body.userId, body.secret)
        delete body.secret
        // TODO
        // await createNotificationSetting()

        if (isValid) {
            const post = await updatePost(year, body, postId)
            handleError(res, post)
            res.status(201).json(post)
        } else {
            res.status(401).json({ error: 'Unauthorized' })
        }
    } catch (e) {
        next(e)
    }
})

module.exports = router
