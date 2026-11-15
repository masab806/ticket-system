const express = require('express')
const router = express.Router()
const { getAllEvents, getCategories, getEventById } = require('../controllers/EventController')

router.get('/', getAllEvents)
router.get('/categories', getCategories)
router.get('/:id', getEventById)

module.exports = router