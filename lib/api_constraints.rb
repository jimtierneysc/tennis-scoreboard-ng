class ApiConstraints
  def initialize(options)
    @version = options[:version]
    @default = options[:default]
  end

  PREFIX = 'application/tennis.scoreboard.v'

  def matches?(req)
    accept = req.headers['Accept']
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
end
