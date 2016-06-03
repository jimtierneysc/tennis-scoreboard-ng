## Tennis scoreboard ng

### Summary

A Rails API application and AngularJS application to keep the score of a tennis match.  

Redesign of * https://github.com/jimtierneysc/tennis-score-board -- a conventional Rails application.

### Two Applications

The root directory contains a Rails API application.  This application implements a REST API for managing
information associated with a tennis match.
  
The client subdirectory contains an AngularJS/Gulp application.  This application communicates with the
Rails API application using conventional $resource calls.

The client subdirectory is located within the Rails API application for convenience.  The two application are 
independent.  

### Progress

COMPLETE

* Nav bar
* Players view
* Teams view
* Matches view
* Scoreboard View

TODO

* Login
* Automatic refresh (using SSE)


### Download

* `git clone https://github.com/jimtierneysc/tennis-scoreboard-ng.git`

### Run on Heroku

TODO
  
### Run Locally

SETUP

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
* Browse
    * `rails s`
    * `cd client`
    * `gulp serve`
* Test
    * `rake test`
    * `rake spec`
    * `cd client`
    * `gulp test`
    

### Using the app

There are four different types of data in this application: players, doubles teams, matches, and scores.  
Eventually there will are two kinds of users: logged-in or guest.  Login is not implements, so anyone can 
dit or delete data. 

### Logging in

TODO

#### Players

* Click Players to view, create, edit and delete players.  
* Click "Player+" to add a player.
* Click trash can to delete a player.
* Click pencil to edit a player.

#### Doubles teams

* Click Teams to view, create, edit and delete doubles teams.  
* Click "Team+" to add a team.
* Click trash can to delete a team.
* Click pencil to edit a team.

#### Matches

* Click Matches to view, create, edit and delete matches.  
* Click "Match+" to add a match.
* Click trash can to delete a match.
* Click pencil to edit a match.
* Client "Score" to jump to the scoreboard for the match.

#### Scoreboard

* Click Scoreeboard to view and edit scores.  
* Select a match from a list. 
* Use the "menu" to toggle various options
    * Choose the "Keep Score" option to enable scoring

