module Api
  module V1
    class TasksController < BaseController
      before_action :set_task, only: [ :show, :update, :destroy ]

      def index
        tasks = Task.includes(:category)
          .search_by_title(params[:q])
          .filter_by_status(params[:status])
          .filter_by_category(params[:category_id])
          .filter_by_priority(params[:priority])
          .order(created_at: :desc)

        render json: tasks.map { |task| task_json(task) }
      end

      def show
        render json: task_json(@task)
      end

      def create
        task = Task.new(task_params)

        if task.save
          render json: task_json(task), status: :created
        else
          render_unprocessable(task)
        end
      end

      def update
        if @task.update(task_params)
          render json: task_json(@task)
        else
          render_unprocessable(@task)
        end
      end

      def destroy
        @task.destroy
        head :no_content
      end

      private

      def set_task
        @task = Task.includes(:category).find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_not_found
      end

      def task_params
        params.require(:task).permit(:title, :description, :status, :priority, :due_date, :category_id)
      end

      # タスクをJSON形式にシリアライズ
      def task_json(task)
        {
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          due_date: task.due_date,
          category: task.category ? { id: task.category.id, name: task.category.name } : nil,
          created_at: task.created_at,
          updated_at: task.updated_at
        }
      end
    end
  end
end
