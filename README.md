## Tennis Scoreboard Ng

### Summary

This project implements an SPA to keep the score of tennis matches. The back-end consists of
a Rails API application.  The client consists of an AngularJS application.

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
    
### Run on Elastic Beanstalk

1. Open the [Elastic Beanstalk Console](https://console.aws.amazon.com/elasticbeanstalk/)
    * Choose "Create New Application" link.  Proceed through the configuration pages:
        * Application Information Page
            * Fill in Application name. Enter "tennis" for example.
            * Click "Next"
        * New Environment Page
            * Click "Create web server" button
        * Environment Type Page
            * Predefined configuration: "Ruby"
            * Click "Change platform version"
            * Select "2.2 (Puma) on 64bit..."
            * Click "Next"
        * Application Version Page
            * Source: "Sample application"
            * Click "Next"
        * Environment Information Page
            * Click "Next" 
        * Additional Resources Page
            * Check "Create an RDS DB Instance..."
            * Click "Next"
        * Configuration Details Page
            * Instance Type: "t2.micro" (t2.micro seems to be the minimum requirement. The default type, "t1.micro", results in out of memory errors during deploy)
            * Click "Next"
        * Environment Tags Page
            * Click "Next"
        * RDS Configuration Page
            * DB engine: "postgres"
            * Instance class: db.t2.micro (db.t2.micro is the minimum requirement.  Other instance classes are more expensive)
            * Username: make up a user name
            * Password: make up a password
            * Click "Next"
        * Permissions Page
            * Click "Next"
        * Review Page
            * Look over settings.  Be sure that "Ruby 2.2 (puma)", "postgres", and "t2.micro" are selected. 
            * Click "Launch"
        * Elastic Beanstalk should start creating your environment. It takes a while to 
        finish.
    * After the environment has been created, you can open the Sample Application in a browser by clicking on the 
    environment URL.  The URL is displayed next to the environment name in the Elastic Beanstalk Console.
2. Install [Elastic Beanstalk CLI](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html) on your desktop
3. [Configure the EB CLI](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-configuration.html)
     * `cd tennis-score-board-ng`
     * `eb init`
         * When prompted, choose the application that was just created
         * When prompted, add SSH.  You will use SSH to run rake tasks
4. Deploy tennis-score-board-ng
     * `eb deploy` (This will take a while--perhaps 5 minutes)
     * If there is an error, the logs might provide a clue: `eb logs`
5. Run it
     * `eb open` (or refresh the Sample Application page)
     * The tennis home page should show automatically, instead of the Elastic Beanstalk
     Sample Application
     * The responses from the relative paths api/players, api/matches, and api/teams, should 
     be empty JSON arrays.
6. Add application data
     * `eb ssh`
     * `cd /var/app/current`
     * Add a user
         * `rake db:seed username=someuser password=somepassword`
     * Add sample data
        * `rake db:sample_data`
* Customizing deployment tasks and settings
    * The deployment tasks and settings are specified in [01setup.config](https://github.com/jimtierneysc/tennis-scoreboard-ng/blob/master/.ebextensions/01setup.config)
        * Builds the AngularJS project
        * Customizes nginx routes
        * Restarts nginx
    * To change the tasks or settings, modify the .config file or add another .config file

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
    
### User guide

#### Logging in

* A login link appears in the upper right corner of the page.  Enter the password and username specified with
the db:seed command.  Login is only required to edit or keep score.  Login is not required to view.

#### Players, Teams and Matches views

* Choose a link in the navigation bar.
* Each view supports add, delete and edit.
* The Matches view has a link to the match score.

#### Scores view

* Choose "Scores" in the navigation bar or the "Score" link in the Matches view.
* A drop down list is used to select a match.
* When a match is selected, the score board is shown.
* A drop down menu has commands to show or hide visual elements
    * To keep score, choose the menu command to show score keeper commands
    * To show the winners of each game, choose the menu command to show completed games
    
#### Mobile

* The navigation bar collapses when the viewport is narrow
* Click the button on the upper right side of the page to show the navigation links

### Todo

- [x] Readme: Provide instructions for running on AWS 
- [ ] Feature: Show when a game is won by service break
- [ ] Feature: Automatically update clients when the score is changed
- [ ] Build: Travis integration
