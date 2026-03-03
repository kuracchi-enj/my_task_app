module RequestSpecHelper
  def sign_in(user)
    post login_path, params: { login_id: user.login_id, password: 'password' }
  end
end

RSpec.configure do |config|
  config.include RequestSpecHelper, type: :request
end
