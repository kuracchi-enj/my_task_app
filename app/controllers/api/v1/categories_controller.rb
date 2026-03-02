module Api
  module V1
    class CategoriesController < BaseController
      before_action :set_category, only: [ :update, :destroy ]

      def index
        categories = Category.order(:name)
        render json: categories.map { |category| category_json(category) }
      end

      def create
        category = Category.new(category_params)

        if category.save
          render json: category_json(category), status: :created
        else
          render_unprocessable(category)
        end
      end

      def update
        if @category.update(category_params)
          render json: category_json(@category)
        else
          render_unprocessable(@category)
        end
      end

      def destroy
        @category.destroy
        head :no_content
      end

      private

      def set_category
        @category = Category.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_not_found
      end

      def category_params
        params.require(:category).permit(:name)
      end

      def category_json(category)
        { id: category.id, name: category.name }
      end
    end
  end
end
