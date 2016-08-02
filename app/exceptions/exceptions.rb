module Exceptions
  class ApplicationError < StandardError; end
  class Duplicate < ApplicationError; end
  class NotFound < ApplicationError; end
  class InvalidOperation < ApplicationError; end
  class UnknownOperation < ApplicationError; end
  class LoginRequired < ApplicationError; end
end
