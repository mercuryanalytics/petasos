class TestController < ApplicationController
  include Secured

  def hello
    render json: { message: 'hello', auth: auth_token }
  end

  def projects
    render json: Project.all
  end
end
