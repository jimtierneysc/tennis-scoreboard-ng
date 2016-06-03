## Tennis scoreboard ng

### Summary

A Rails API application and AngularJS application to keep the score of a tennis match.  

Redesign of https://github.com/jimtierneysc/tennis-score-board

### Two Applications

The root directory contains a Rails API application.  This application implements a REST API for managing
information associated with a tennis match.
  
The client subdirectory contains an AngularJS/Gulp application.  This application communicates with the
Rails API application using conventional Angular $resource calls.

The two application are built independently.    

### Progress

COMPLETE

* Nav bar
* Players view
* Teams view
* Matches view
* Scoreboard View

TODO

* Login
* Automatic scoreboard refresh


### Download

* `git clone https://github.com/jimtierneysc/tennis-scoreboard-ng.git`

### Run on Heroku

* `sudo gem install heroku` (if not already installed)
* `cd tennis-score-board-ng`
* Buildpack setup (see https://www.angularonrails.com/deploy-angular-2rails-5-app-heroku/)
  * `heroku buildpacks:add https://github.com/jasonswett/heroku-buildpack-nodejs`
  * `heroku buildpacks:add heroku/ruby`
* `git push heroku master`
* DB setup
    * `heroku run rake db:migrate`
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
    * TODO when login is working
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
    * `rake test`
    * `rake spec`
    * `cd client`
    * `gulp test`
    

### Using the app

There are four different types of data in this application: players, doubles teams, matches, and scores.  
Login is not implemented yet, so for now anyone can create, edit or delete data. 

#### Players

* Click "Players" to view, create, edit and delete players.
* Players view
    * Click "Player+" to add a player.
    * Click trashcan to delete a player.
    * Click pencil to edit a player.

#### Doubles teams

* Click "Teams" to view, create, edit and delete doubles teams.  

#### Matches

* Click "Matches" to view, create, edit and delete matches.
* Matches view
    * Click "Score" to show scoreboard for a match.

#### Scoreboard

* Click "Scoreboard" to view and edit scores.  
* Scoreboard view
    * Select a match from a list. 
    * Use the "menu" to toggle various options
        * Choose the "Keep Score" option to enable scoring

