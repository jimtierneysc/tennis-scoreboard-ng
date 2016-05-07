# Create user that may modify data
#
# rake db:seed username=someusername password=somepassword
#
# to create sample data use
#   rake db:sample_data

User.destroy_all

username = ENV['username']
password = ENV['password']
unless password && username
  raise Exception, 'Expect username and password ENV variables'
end

users = User.create! username: username, password: password