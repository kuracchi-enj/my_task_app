module Api
  module V1
    class BaseController < ApplicationController
      # CSRFトークン検証をJSON APIリクエストでも有効にする
      protect_from_forgery with: :exception

      private

      def render_not_found
        render json: { error: "Not Found" }, status: :not_found
      end

      def render_unprocessable(resource)
        render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
      end
    end
  end
end
