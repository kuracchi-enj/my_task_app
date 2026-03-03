class SessionsController < ApplicationController
  skip_before_action :require_login

  def new
    redirect_to root_path if logged_in?
  end

  def create
    user = User.find_by(login_id: params[:login_id])

    if user&.authenticate(params[:password])
      session[:user_id] = user.id
      redirect_to root_path, notice: "ログインしました"
    else
      flash.now[:alert] = "ユーザーIDまたはパスワードが正しくありません"
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    session.delete(:user_id)
    redirect_to login_path, notice: "ログアウトしました"
  end
end
