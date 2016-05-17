## Tennis scoreboard ng

### Summary

A rails app to keep the score of a tennis match.  

Redesign of * https://github.com/jimtierneysc/tennis-score-board using 
AngularJS and Rails API.


### Progress

COMPLETE

* Nav bar
* Players view

TODO

* Login
* Teams view
* Matches view
* Scoreboard
* Keep Score


### Download

* `git clone https://github.com/jimtierneysc/tennis-scoreboard-ng.git`

### Run on Heroku

TODO
  
### Run Locally

BACKEND SETUP

* `cd tennis-score-board-ng`
* `bundle install`
* DB setup
    * Install Postgres server
    * `rake db:create`
    * `rake db:migrate`
* Add a user
    TODO
* Sample data
    * `rake db:sample_data`
    * `rake db:clear_data` to clear
* Browse
    * `rails s`
    * visit `http://localhost:3000`
* Test
    * `rake test`
    
FRONTEND SETUP

* cd frontend
* TODO (bower and npm setup)
* gulp serve

### Using the app

There are four different types of data in this application: players, doubles teams, matches, and scores.  
There are two kinds of users: logged-in or guest.  In order to
edit or delete data, the user must be logged in. 

### Logging in

TODO

#### Players

* Click Players to view, create and delete players.  
* Click "+" to add a player.
* Click trash to delete a player.

#### Doubles teams

Not implemented

#### Matches

Not implemented

#### Scoreboard

Not implemented

#### Keeping score

Not implemented

