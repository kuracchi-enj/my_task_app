module Api
  module V1
    class UsersController < BaseController
      def index
        users = User.order(:name).map { |u| { id: u.id, name: u.name, login_id: u.login_id } }
        render json: users
      end

      def me
        render json: {
          id: current_user.id,
          login_id: current_user.login_id,
          name: current_user.name,
          group_name: current_user.group&.name,
          is_admin: current_user.group&.admin? || false
        }
      end
    end
  end
end
