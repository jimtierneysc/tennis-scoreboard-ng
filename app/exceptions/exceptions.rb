# Custom exception classes
#
module Exceptions
  # Base class for application exceptions
  class ApplicationError < StandardError; end
  # Could not find an object that was needed to perform an operation
  class NotFound < ApplicationError; end
  # Attempt to execute an operation that is not allowed at this time
  class InvalidOperation < ApplicationError; end
  # Attempt to execute an operation that is not recognized
  class UnknownOperation < ApplicationError; end
end
