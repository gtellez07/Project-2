// required packages
require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const db = require('./models')
const crypto = require('crypto-js')
const bcrypt = require('bcrypt')
const axios = require('axios')
const { createDomStream } = require('htmlparser2')
const Faves = require('./controllers/favorites')


//app config
const app = express()
const PORT = process.env.PORT || 8000
app.set('view engine', 'ejs')
//parse request bodies from html forms
app.use(express.urlencoded({ extended: false }))
//tell express to parse incoming cookies
app.use(cookieParser())
app.use(express.json())


//custom auth middleware that checks the cookies for a user id
//and if it finds one, look up the user in the db
//tell all downstream routes about this user
app.use(async (req,res,next)=>{
    try {
        if(req.cookies.userId) {
            // decrypt the user id and turn it into a string
            const decryptedId = crypto.AES.decrypt(req.cookies.userId, process.env.SECRET)
            const decryptedString = decryptedId.toString(crypto.enc.Utf8)
            //the user is logged in, lets find them in the db
            const user = await db.user.findByPk(decryptedString)
            //mount the logged in user on the res.locals
            res.locals.user = user
        } else {
            //set the logged in user to be null for conditional rendering
            res.locals.user = null
        }
        //move on to next middleware/route
        next()
    } catch (err){
        console.log('error in auth middleware: 🔥🔥🔥', err)
        //explicitly set user to null if there is an error
        res.locals.user = null
        next() //go to the next thing
    }
})

//example custom middleware
app.use((req, res, next) =>{
    //our code goes here
    // console.log("Hello from inside of the middleware")
    console.log(`incoming request: ${req.method} - ${req.url}`)
    //res.locals are a place that we can put data to share with 'downstream routes'
    // res.locals.myData = 'hello i am data'
    //invoke next to tell express to go to the next route or middle
    next()
})



app.get('/', async (req, res) => {
 
    try {
        let id = res.locals.user.id
        let f = await Faves.getFavorites(id)
        let arr = []
        for (let i = 0; i < f.length; i++)  {
            arr.push(f[i].dataValues.recipeId)
          }
        console.log(arr)
        let url = "https://www.themealdb.com/api/json/v1/1/search.php?s=Chicken";
        let response = await axios.get(url);
        // console.log(response.data);
        res.render('home.ejs', {
            user: req.cookies.userId,
            data: response.data,
            favorite: arr
        })
    } catch (error) {
        console.error(error);
    }
})

app.get('/allRecipes', async (req, res) => {
    try {
        res.render('allRecipes.ejs', {
            user: req.cookies.userId,
            data: null
        })
    } catch (error) {
        console.error(error);
    }
})

app.get('/allRecipes:search', async (req, res) => {
 
    try {
        let searchValue = req.query.searchName
        let url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchValue}`;
        let response = await axios.get(url);
        console.log(response.data);
        res.render('allRecipes.ejs', {
            user: req.cookies.userId,
            data: response.data
        })
    } catch (error) {
        console.error(error);
    }
})


app.get('/favorites', async (req, res) => {
 
    try {
        userId = req.cookies.userId
        data = null
        // get favorite recipe id's from DB

        // loop over list and call api
        // for each favorite ->
        let url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`;
        let response = await axios.get(url);
        console.log(response.data);
        // spread opperator 
        data = {...data, ...response.data};

        //out of loop do this.
        res.render('favorites.ejs', {
            user: req.cookies.userId,
            data: data
        })
    } catch (error) {
        console.error(error);
    }
})

app.post('/recipes/:id',async (req,res)=>{
    try {
        let recipeId = req.body.recipeId
        let remove = req.body.remove
        let decryptedId = crypto.AES.decrypt(req.cookies.userId, process.env.SECRET)
        let userId = decryptedId.toString(crypto.enc.Utf8)
        console.log(userId)
        if(remove == 0) {
            const [newFavorite, created] = await db.favorite.findOrCreate({
                where: {
                    recipeId: recipeId,
                    userId: userId
                }
            })
            if (!created){
                newFavorite.userId = userId
                newFavorite.recipeId = recipeId
                let f = await newFavorite.save()
                console.log(f)
            }
        } else {
            let destroy = await Faves.deleteFavorite(recipeId, userId)
            console.log(destroy)
        } 
         
        let f = await Faves.getFavorites(userId)
        let arr = []
        for (let i = 0; i < f.length; i++)  {
            arr.push(f[i].dataValues.recipeId)
          }
        let url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`;
        console.log(url)
        let response = await axios.get(url);
        // console.log(res.locals.user);
        res.render('home.ejs', {
            user: req.cookies.userId,
            data: response.data,
            favorite: arr 
        }) 
    } catch (error) {
        console.error(error);
    }
})


//routes and controllers
app.get('/', (req, res) =>{
    console.log(res.locals)
    res.render('home.ejs', {
        user: res.locals.user
    })
})

app.use('/users', require('./controllers/users'))

// app.use('/allRecipes', require('./controllers/routes'))

//listen on a port
app.listen(PORT, ()=>{
    console.log(`authenticating users on PORT ${PORT} 🔐`)
})
