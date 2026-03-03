require 'rails_helper'

RSpec.describe 'Api::V1::Tasks', type: :request do
  let(:headers) { { 'Content-Type' => 'application/json', 'Accept' => 'application/json' } }
  let(:category) { create(:category) }
  let(:tasks) { create_list(:task, 3) }
  let(:user) { create(:user) }

  before { sign_in(user) }

  describe 'GET /api/v1/tasks' do
    it 'タスク一覧を返す' do
      tasks
      get '/api/v1/tasks', headers: headers
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).size).to eq(3)
    end

    context 'when タイトル検索' do
      let(:target_task) { create(:task, title: '検索対象タスク') }

      it '部分一致でフィルタリングされる' do
        target_task
        get '/api/v1/tasks', params: { q: '検索対象' }, headers: headers
        body = JSON.parse(response.body)
        expect(body.size).to eq(1)
        expect(body.first['title']).to eq('検索対象タスク')
      end
    end

    context 'when ステータスフィルター' do
      let(:responding_task) { create(:task, status: :responding) }

      it '指定ステータスのみ返す' do
        responding_task
        get '/api/v1/tasks', params: { status: 'responding' }, headers: headers
        body = JSON.parse(response.body)
        expect(body.all? { |t| t['status'] == 'responding' }).to be true
      end
    end

    context 'when 優先度フィルター' do
      let(:high_task) { create(:task, priority: :high) }

      it '指定優先度のみ返す' do
        high_task
        get '/api/v1/tasks', params: { priority: 'high' }, headers: headers
        body = JSON.parse(response.body)
        expect(body.all? { |t| t['priority'] == 'high' }).to be true
      end
    end
  end

  describe 'GET /api/v1/tasks/:id' do
    let(:task) { tasks.first }

    it 'タスク詳細を返す' do
      get "/api/v1/tasks/#{task.id}", headers: headers
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['id']).to eq(task.id)
    end

    it '存在しないIDの場合404を返す' do
      get '/api/v1/tasks/0', headers: headers
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'POST /api/v1/tasks' do
    let(:valid_params) do
      { task: { title: '新しいタスク', status: 'pending', priority: 'medium' } }
    end

    it 'タスクを作成できる' do
      expect {
        post '/api/v1/tasks', params: valid_params.to_json, headers: headers
      }.to change(Task, :count).by(1)
      expect(response).to have_http_status(:created)
    end

    it 'タイトルが空の場合422を返す' do
      post '/api/v1/tasks',
           params: { task: { title: '', status: 'pending', priority: 'medium' } }.to_json,
           headers: headers
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'PATCH /api/v1/tasks/:id' do
    let(:task) { tasks.first }

    it 'タスクを更新できる' do
      patch "/api/v1/tasks/#{task.id}",
            params: { task: { title: '更新後タイトル' } }.to_json,
            headers: headers
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['title']).to eq('更新後タイトル')
    end
  end

  describe 'DELETE /api/v1/tasks/:id' do
    let(:task) { tasks.first }

    it 'タスクを削除できる' do
      task_id = task.id
      expect {
        delete "/api/v1/tasks/#{task_id}", headers: headers
      }.to change(Task, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end
  end
end
