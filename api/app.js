const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const router = express.Router()
const postsRoutes = require('./routes/posts/posts.controller')
const commentsRoutes = require('./routes/comments/comments.controller')

// const notificationsRoutes = require('./routes/notifications/notifications.controller')
// const pollsRoutes = require('./routes/polls/polls.controller')
// const usersRoutes = require('./routes/users/users.controller')
// const commentsRoutes = require('./routes/comments/comments.controller')
// const routes = require('./routes/routes')
// const cors = require('cors')
// router.use(cors())

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

app.use('/', router)
app.use('/', postsRoutes)
app.use('/', commentsRoutes)
// app.use('/', notificationsRoutes)
// app.use('/', pollsRoutes)
// app.use('/', usersRoutes)
// app.use('/', commentsRoutes)

module.exports = app;