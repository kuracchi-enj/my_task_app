require 'rails_helper'

RSpec.describe "MCP", type: :request do
  let(:headers) { { "Content-Type" => "application/json", "Accept" => "application/json" } }

  def post_mcp(body)
    post '/mcp', params: body.to_json, headers: headers
  end

  describe 'initialize' do
    it 'プロトコルバージョンとサーバー情報を返す' do
      post_mcp({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} })

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['result']['protocolVersion']).to eq('2024-11-05')
      expect(body['result']['serverInfo']['name']).to eq('my_task_app')
    end
  end

  describe 'tools/list' do
    it '登録済みツール一覧を返す' do
      post_mcp({ jsonrpc: '2.0', id: 2, method: 'tools/list' })

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      tool_names = body['result']['tools'].map { |t| t['name'] }
      expect(tool_names).to include('task_index', 'task_show', 'task_create', 'task_update', 'task_destroy')
    end

    it '各ツールに inputSchema が含まれる' do
      post_mcp({ jsonrpc: '2.0', id: 2, method: 'tools/list' })

      body = JSON.parse(response.body)
      expect(body['result']['tools']).to all(include('inputSchema'))
    end
  end

  describe 'tools/call' do
    describe 'task_index' do
      let(:tasks) { create_list(:task, 3) }

      it 'タスク一覧をJSON文字列で返す' do
        tasks
        post_mcp({
          jsonrpc: '2.0', id: 3,
          method: 'tools/call',
          params: { name: 'task_index', arguments: {} }
        })

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        content_text = body['result']['content'].first['text']
        tasks_data = JSON.parse(content_text)
        expect(tasks_data.size).to eq(3)
      end

      it 'ステータスフィルターが機能する' do
        create(:task, status: :responding)
        post_mcp({
          jsonrpc: '2.0', id: 4,
          method: 'tools/call',
          params: { name: 'task_index', arguments: { status: 'responding' } }
        })

        body = JSON.parse(response.body)
        tasks_data = JSON.parse(body['result']['content'].first['text'])
        expect(tasks_data.all? { |t| t['status'] == 'responding' }).to be true
      end
    end

    describe 'task_show' do
      let!(:task) { create(:task) }

      it 'タスク詳細をJSON文字列で返す' do
        post_mcp({
          jsonrpc: '2.0', id: 5,
          method: 'tools/call',
          params: { name: 'task_show', arguments: { id: task.id } }
        })

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        task_data = JSON.parse(body['result']['content'].first['text'])
        expect(task_data['id']).to eq(task.id)
        expect(task_data['title']).to eq(task.title)
      end

      it '存在しないIDの場合isError: trueを返す' do
        post_mcp({
          jsonrpc: '2.0', id: 6,
          method: 'tools/call',
          params: { name: 'task_show', arguments: { id: 0 } }
        })

        body = JSON.parse(response.body)
        expect(body['result']['isError']).to be true
      end
    end

    describe 'task_create' do
      it 'タスクを作成してJSONを返す' do
        expect {
          post_mcp({
            jsonrpc: '2.0', id: 7,
            method: 'tools/call',
            params: { name: 'task_create', arguments: { title: '新しいタスク', priority: 'high' } }
          })
        }.to change(Task, :count).by(1)

        body = JSON.parse(response.body)
        task_data = JSON.parse(body['result']['content'].first['text'])
        expect(task_data['title']).to eq('新しいタスク')
        expect(task_data['priority']).to eq('high')
      end

      it 'タイトルが空の場合isError: trueを返す' do
        expect {
          post_mcp({
            jsonrpc: '2.0', id: 8,
            method: 'tools/call',
            params: { name: 'task_create', arguments: { title: '' } }
          })
        }.not_to change(Task, :count)

        body = JSON.parse(response.body)
        expect(body['result']['isError']).to be true
      end
    end

    describe 'task_update' do
      let!(:task) { create(:task) }

      it 'タスクを更新してJSONを返す' do
        post_mcp({
          jsonrpc: '2.0', id: 9,
          method: 'tools/call',
          params: { name: 'task_update', arguments: { id: task.id, title: '更新後タイトル' } }
        })

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        task_data = JSON.parse(body['result']['content'].first['text'])
        expect(task_data['title']).to eq('更新後タイトル')
      end
    end

    describe 'task_destroy' do
      let!(:task) { create(:task) }

      it 'タスクを削除してsuccess: trueを返す' do
        expect {
          post_mcp({
            jsonrpc: '2.0', id: 10,
            method: 'tools/call',
            params: { name: 'task_destroy', arguments: { id: task.id } }
          })
        }.to change(Task, :count).by(-1)

        body = JSON.parse(response.body)
        result_data = JSON.parse(body['result']['content'].first['text'])
        expect(result_data['success']).to be true
      end
    end

    it '不明なツール名の場合エラーを返す' do
      post_mcp({
        jsonrpc: '2.0', id: 11,
        method: 'tools/call',
        params: { name: 'unknown_tool', arguments: {} }
      })

      body = JSON.parse(response.body)
      expect(body['error']['code']).to eq(-32_602)
    end
  end

  describe '不正なリクエスト' do
    it 'JSONパースエラーの場合400を返す' do
      post '/mcp', params: 'invalid json', headers: headers
      expect(response).to have_http_status(:bad_request)
      body = JSON.parse(response.body)
      expect(body['error']['code']).to eq(-32_700)
    end

    it '未知のメソッドの場合エラーを返す' do
      post_mcp({ jsonrpc: '2.0', id: 99, method: 'unknown/method' })

      body = JSON.parse(response.body)
      expect(body['error']['code']).to eq(-32_601)
    end
  end
end
