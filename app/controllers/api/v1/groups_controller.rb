module Api
  module V1
    class GroupsController < BaseController
      before_action :require_admin
      before_action :set_group, only: [ :update, :destroy ]

      def index
        groups = Group.order(:id).map { |g| { id: g.id, name: g.name, admin: g.admin } }
        render json: groups
      end

      def create
        group = Group.new(group_params)

        if group.save
          render json: { id: group.id, name: group.name, admin: group.admin }, status: :created
        else
          render_unprocessable(group)
        end
      end

      def update
        if @group.update(group_params)
          render json: { id: @group.id, name: @group.name, admin: @group.admin }
        else
          render_unprocessable(@group)
        end
      end

      def destroy
        @group.destroy
        head :no_content
      end

      private

      def set_group
        @group = Group.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_not_found
      end

      def group_params
        params.require(:group).permit(:name)
      end
    end
  end
end
