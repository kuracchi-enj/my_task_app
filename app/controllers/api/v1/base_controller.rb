module Api
  module V1
    class BaseController < ApplicationController
      # JSON APIではセッションを使わないため、CSRFトークン不正時はセッションをクリアする
      protect_from_forgery with: :null_session

      private

      def require_admin
        unless current_user&.group&.admin?
          render json: { error: "Forbidden" }, status: :forbidden
        end
      end

      def render_not_found
        render json: { error: "Not Found" }, status: :not_found
      end

      def render_unprocessable(resource)
        render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
      end
    end
  end
end
