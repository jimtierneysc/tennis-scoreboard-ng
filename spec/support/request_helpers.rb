module Request
  module JsonHelpers
    def json_response
      @json_response ||= JSON.parse(response.body, symbolize_names: true) 
    end
  end

  module HeadersHelpers
    def api_accept_header_version(version = 1)
      api_accept_header "application/tennis.scoreboard.v#{version}"
    end

    def api_accept_header(value)
      request.headers['Accept'] = value
    end

    def api_authorization_header(token)
      request.headers['Authorization'] = token
    end

    def include_default_accept_headers
      api_response_format
    end

    # private
    def api_response_format(format = Mime::JSON)
      request.headers['Content-Type'] = format.to_s
    end

   end
end
