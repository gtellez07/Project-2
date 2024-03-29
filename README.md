# MealMate
MealMate is a web application that allows users to search and save their favorite recipes from a comprehensive database using the MealDB API. The application provides users with the ability to create accounts, view their profiles, search for recipes by name or ingredient, add recipes to their favorites, and leave comments on their saved recipes. MealMate is built using HTML, CSS, JavaScript, and Express with EJS templates for rendering dynamic content. The application uses PostgreSQL for the database with Sequelize as the ORM and Axios for handling HTTP requests to the MealDB API.
#
## Description
#
## Installation Instruction
* Fork and Clone repo to your local repository
* Run npm init-y to initialize npm
* open the repo and navigate to package.json file and see a list of npm packages listed under dependencies
* Run npm i in the terminal to download all required npm packages. node_modules should appear in the folder
* Make sure node_modules and .env are in the gitignore file before committing to remote repository
* Run sequelize db:create to create database in psql
* Run sequelize db:migrate to migrate the models
* 
#
# API
# https://www.themealdb.com/api.php
#
# MVP
* Homescreen with buttons to login or Sign up
* Sign-up page that gives option to sign up and create account
* User/favorites page that has favorite recipes as well as option to click on Recipe to add a comment 
* Search bar that allows user to search the API by recipe name or ingredient
* update account page that allows user to update their credentials
#
#
# Tech Stack
* html
* Javascript
* css
* Express
* EJS
* Postgres
* Sequelize
* Cookie Parser
* Axios
* Dotenv
#
# ERDs
<img src='./images/ERDdiagram.png'>

#
# Restful Routing Chart
<img src='./images/RESTful.png'>
 

# Wireframes
<img src='./images/WireFrame1.png'>
<img src='./images/WireFrame2.png'>
<img src='./images/WireFrame3.png'>


# User Stories
* As a user, I want to be able to create a new profile
* As a user, I want to be able to view my profile
* As a user, I want to be able to search for recipes
* As a user, I want to be able to add recipes to my favorites
* As a user, I want to be able to add comments
#
# STRETCH GOALS
* option to click image that takes you to said recipe related to image
* create another list under my favorites, ex. a desserts favorite list

