class SessionsController < ApplicationController
  layout "login"
  skip_before_action :require_login

  def new
    redirect_to root_path if logged_in?
  end

  def create
    user = User.find_by(login_id: params[:login_id])

    if user&.authenticate(params[:password])
      session[:user_id] = user.id
      respond_to do |format|
        format.html { redirect_to root_path, notice: "ログインしました" }
        format.json { render json: { ok: true }, status: :ok }
      end
    else
      respond_to do |format|
        format.html do
          flash.now[:alert] = "ユーザーIDまたはパスワードが正しくありません"
          render :new, status: :unprocessable_entity
        end
        format.json { render json: { error: "ユーザーIDまたはパスワードが正しくありません" }, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    session.delete(:user_id)
    redirect_to login_path, notice: "ログアウトしました"
  end
end
