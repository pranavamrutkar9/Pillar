import express from 'express'
import './workers/index.js'
import authRouter from './routes/auth.js'
import workspacesRouter from './routes/workspaces.js'
import invitesRouter from './routes/invites.js'

const app = express()

app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/workspaces', workspacesRouter)
app.use('/api/invites', invitesRouter)

app.listen(4000, () => console.log('API running on port 4000'))
