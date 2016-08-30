## Tennis Scoreboard

### Summary

This project implements an SPA to keep score of tennis matches. The backend is
a Rails API application and the frontend is an AngularJS application.  

### Rails API Application

The root directory contains a Rails API application.  This application implements a REST API for managing
information associated with tennis matches.

### AngularJS Application
  
The client subdirectory contains an AngularJS/Gulp application.  This application communicates with the
Rails API application by making HTTP requests.   

### Download

* `git clone https://github.com/jimtierneysc/tennis-scoreboard-ng.git`

### Run on Heroku

* `sudo gem install heroku` (if not already installed)
* `heroku create your-app-name`
* `cd tennis-score-board-ng`
* Buildpack setup (see https://www.angularonrails.com/deploy-angular-2rails-5-app-heroku/)
  * `heroku buildpacks:add https://github.com/jasonswett/heroku-buildpack-nodejs`
  * `heroku buildpacks:add heroku/ruby`
* `git push heroku master`
* DB setup
    * `heroku run rake db:migrate`
* Add a user
    * `heroku run rake db:seed username=someuser password=somepassword`
* Sample data
    * `heroku run rake db:sample_data`
    * `heroku run rake db:clear_data` to clear
* Browse
    * `horoku open`  or
    * visit `http://your-app-name.heroku.com`
  
### Run Locally

* Package setup
    * `cd tennis-score-board-ng`
    * `bundle install`
    * `cd client`
    * `npm install`
    * `bower install`
* DB setup
    * Install Postgres server
    * `rake db:create`
    * `rake db:migrate`
* Add a user
    * `rake db:seed username=someuser password=somepassword`
* Sample data
    * `rake db:sample_data`
    * `rake db:clear_data` to clear
* Build 
    * `cd client`
    * `gulp build`
* Browse
    * `rails s`
    * `cd client`
    * `gulp serve` or `gulp serve:dist` 
* Test
    * `rake spec`
    * `cd client`
    * `gulp test`
    


### Logging in

* A login link appears in the upper right corner of the page.  Enter the password and username specified with
the db:seed command.  Login is only required to edit or keep score.  Login is not required to view.

#### Players, Teams and Matches views

* Choose a link in the navbar.
* Each view supports add, delete and edit.
* The Matches view has a link to the match score.

#### Scores view

* Choose "Scores" in the navbar or the "Score" link in the Matches view.
* A drop down list is used to select a match.
* When a match is selected, the score board is shown
* A drop down menu has commands to show or hide visual elements
    * If you want to keep score, choose the command to show score keeper commands


