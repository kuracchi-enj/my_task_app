module Api
  module V1
    class UsersController < BaseController
      def me
        render json: {
          id: current_user.id,
          login_id: current_user.login_id,
          name: current_user.name,
          group_name: current_user.group&.name
        }
      end
    end
  end
end
