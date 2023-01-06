// required packages
require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const db = require('./models')
const crypto = require('crypto-js')
const axios = require('axios')
const { createDomStream } = require('htmlparser2')


//app config
const app = express()
const PORT = process.env.PORT || 8000
app.set('view engine', 'ejs')
//parse request bodies from html forms
app.use(express.urlencoded({ extended: false }))
//tell express to parse incoming cookies
app.use(cookieParser())
app.use(express.json())



app.get('/', async (req, res) => {
 
    try {
        let url = "https://www.themealdb.com/api/json/v1/1/search.php?s=Chicken";
        let response = await axios.get(url);
        // console.log(response.data);
        res.render('home.ejs', {
            user: res.locals.user,
            data: response.data
        })
    } catch (error) {
        console.error(error);
    }
})

app.get('/recipes/:id',async (req,res)=>{
    try {
        let recipeId = req.query.recipeId
        console.log(typeof recipeId)
        let url = `www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`;
        console.log(url)
        let response = await axios.get(url);
        console.log(response.data);
        res.render('detail.ejs', {
            user: res.locals.user,
            data: response.data
        }) 
    } catch (error) {
        console.error(error);
    }
})

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
            const user = await db.user.findByPk(req.cookies.userId)
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


//routes and controllers
app.get('/', (req, res) =>{
    console.log(res.locals)
    res.render('home.ejs', {
        user: res.locals.user
    })
})

app.use('/users', require('./controllers/users'))

//listen on a port
app.listen(PORT, ()=>{
    console.log(`authenticating users on PORT ${PORT} 🔐`)
})
