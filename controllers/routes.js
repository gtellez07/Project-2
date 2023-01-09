// create an instance of express routers
const express= require('express')
const router = express.Router()

//GET /allRecipes -- show all chicken reciepes
router.get('/allRecipes', (req,res)=>{
    //if the user is not logged in -- they are not allowed to be here
    if(!res.locals.user) {
        res.redirect('/users/login?message=You must authenticate before you are authorized to view this resource!')
    } else {
        res.render('allRecipes.ejs', {
            user: res.locals.user
        })
    }
})

// get // allRecipes -- search by name
// www.themealdb.com/api/json/v1/1/search.php?s=Arrabiata



//export the router
module.exports = router
