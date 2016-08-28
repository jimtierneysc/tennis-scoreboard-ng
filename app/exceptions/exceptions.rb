# Custom exception classes
#
module Exceptions
  class ApplicationError < StandardError; end
  class NotFound < ApplicationError; end
  class InvalidOperation < ApplicationError; end
  class UnknownOperation < ApplicationError; end
end
