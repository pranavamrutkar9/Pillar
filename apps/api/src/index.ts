import express from 'express'
import './workers/index.js'
import authRouter from './routes/auth.js'
import workspacesRouter from './routes/workspaces.js'
import invitesRouter from './routes/invites.js'
import projectsRouter from './routes/projects.js'
import projectSingularRouter from './routes/project.js'
import issuesRouter from './routes/issues.js'
import commentsRouter from './routes/comments.js'
import statusesRouter from './routes/statuses.js'
import labelsRouter from './routes/labels.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/workspaces', workspacesRouter)
app.use('/api/workspaces/:workspaceId/projects', projectsRouter)
app.use('/api/projects', projectSingularRouter)
app.use('/api/projects/:projectId/issues', issuesRouter)
app.use('/api/projects/:projectId/statuses', statusesRouter)
app.use('/api/projects/:projectId/labels', labelsRouter)
app.use('/api/issues/:issueId/comments', commentsRouter)
app.use('/api/invites', invitesRouter)

app.use(errorHandler)

import { createServer } from 'http'
import { initSocket } from './lib/socket.js'

const httpServer = createServer(app)
initSocket(httpServer)

httpServer.listen(4000, () => console.log('API & Socket Server running on port 4000'))
