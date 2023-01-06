const express = require('express');
const router = express.Router();
const axios = require('axios')
const db = require('../models')

router.get('/', async (req,res)=>{
    try {
        const allFavorites = await db.mealdb.findAll()
        console.log('FAVES:', allFavorites)
        res.render('favorite', {mealdb: allFavorites})
    } catch(err) {
        console.error(err)
    }
})

router.post('/', async (req, res) =>{
    try {
        const newFave = await db.mealdb.findOrCreate({
            where: {
                name: req.body.name
            }
        })
        console.log("NEWFAVE:", newFave)
        res.redirect('/mealdb')
    } catch(err) {
        console.error(err)
    }
})

router.get('/:name', async (req, res)=>{
    try{
        const mealName = req.params.name
        const apiURL = `"https://www.themealdb.com/api/json/v1/1/${mealName}.php";`
        const foundData = await axios.get(apiURL)
        res.render('show', {mealdb: foundData.data})
    } catch (err) {
        console.error(err)
    }
})

module.exports = router;