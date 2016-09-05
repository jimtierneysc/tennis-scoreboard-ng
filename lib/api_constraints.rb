# Determine if a router request matches an api version number
class ApiConstraints

  # * *Args*    : options
  #   - +version+ -> number
  #     - Version number to match
  #   - +default+ -> Boolean
  #     - If request does not identify a version, default to +version+
  def initialize(options)
    @version = options[:version]
    @default = options[:default]
  end

  # Determine whether a request matches
  # an api version number
  #
  # * *Args*    :
  #   - +request+ -> router request
  # * *Returns* : Boolean
  #   - +:true+ - the request matches the api version
  #   - +:false+ - the request does not match the api version
  def matches?(request)
    accept = request.headers['Accept']
    if accept.nil?
      @default
    else
      if @default && !accept.include?(PREFIX)
        true
      else
        accept.include?("#{PREFIX}#{@version}")
      end
    end
  end

  private

  # version prefix string
  PREFIX = 'application/tennis.scoreboard.v'
end
