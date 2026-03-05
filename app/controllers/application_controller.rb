class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  before_action :require_login

  private

  def current_user
    @current_user ||= User.find_by(id: session[:user_id])
  end
  helper_method :current_user

  def logged_in?
    current_user.present?
  end
  helper_method :logged_in?

  def require_login
    return if request.headers["X-Mcp-Internal-Token"] == MonkeyMcp.configuration.internal_token

    unless logged_in?
      redirect_to login_path, alert: "ログインしてください"
    end
  end
end
