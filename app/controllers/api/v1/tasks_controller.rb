module Api
  module V1
    class TasksController < BaseController
      include MonkeyMcp::Toolable

      TASK_ATTRS = %w[title description status priority due_date category_id assignee_id].freeze
      INDEX_PARAMS = %w[q status category_id priority assignee_id].freeze

      before_action :set_task, only: [ :show, :update, :destroy ]

      mcp_desc "タスク一覧を取得する。タイトル検索・ステータス・カテゴリ・優先度でフィルタリング可能。"
      def index
        tasks = Task.includes(:category, :assignee, :created_by, :updated_by)
          .search_by_title(params[:q])
          .filter_by_status(params[:status])
          .filter_by_category(params[:category_id])
          .filter_by_priority(params[:priority])
          .filter_by_assignee(params[:assignee_id])
          .order(created_at: :desc)

        render json: tasks.map { |task| task_json(task) }
      end

      mcp_desc "指定IDのタスク詳細を取得する。"
      def show
        render json: task_json(@task)
      end

      mcp_desc "新しいタスクを作成する。"
      def create
        task = Task.new(task_params)
        task.created_user_id = current_user&.id
        task.updated_user_id = current_user&.id

        if task.save
          render json: task_json(task), status: :created
        else
          render_unprocessable(task)
        end
      end

      mcp_desc "指定IDのタスクを更新する。"
      def update
        @task.updated_user_id = current_user&.id

        if @task.update(task_params)
          render json: task_json(@task)
        else
          render_unprocessable(@task)
        end
      end

      mcp_desc "指定IDのタスクを削除する。"
      def destroy
        @task.destroy
        head :no_content
      end

      private

      def set_task
        @task = Task.includes(:category, :assignee, :created_by, :updated_by).find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_not_found
      end

      def task_params
        params.require(:task).permit(:title, :description, :status, :priority, :due_date, :category_id, :assignee_id)
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
          assignee: user_summary(task.assignee),
          created_by: user_summary(task.created_by),
          updated_by: user_summary(task.updated_by),
          created_at: task.created_at,
          updated_at: task.updated_at
        }
      end

      def user_summary(user)
        return nil unless user

        { id: user.id, name: user.name }
      end
    end
  end
end
