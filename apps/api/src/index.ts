import express from 'express'
import './workers/index.js'

const app = express()
app.listen(4000, () => console.log('API running on port 4000'))
