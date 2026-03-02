require 'rails_helper'

RSpec.describe 'Api::V1::Categories', type: :request do
  let(:headers) { { 'Content-Type' => 'application/json', 'Accept' => 'application/json' } }
  let!(:categories) { create_list(:category, 3) }

  describe 'GET /api/v1/categories' do
    it 'カテゴリ一覧を返す' do
      get '/api/v1/categories', headers: headers
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).size).to eq(3)
    end
  end

  describe 'POST /api/v1/categories' do
    it 'カテゴリを作成できる' do
      expect {
        post '/api/v1/categories',
             params: { category: { name: '新カテゴリ' } }.to_json,
             headers: headers
      }.to change(Category, :count).by(1)
      expect(response).to have_http_status(:created)
    end

    it '名前が空の場合422を返す' do
      post '/api/v1/categories',
           params: { category: { name: '' } }.to_json,
           headers: headers
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it '重複した名前の場合422を返す' do
      existing_name = categories.first.name
      post '/api/v1/categories',
           params: { category: { name: existing_name } }.to_json,
           headers: headers
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'PATCH /api/v1/categories/:id' do
    let(:category) { categories.first }

    it 'カテゴリを更新できる' do
      patch "/api/v1/categories/#{category.id}",
            params: { category: { name: '更新後カテゴリ' } }.to_json,
            headers: headers
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['name']).to eq('更新後カテゴリ')
    end
  end

  describe 'DELETE /api/v1/categories/:id' do
    let(:category) { categories.first }

    it 'カテゴリを削除できる' do
      expect {
        delete "/api/v1/categories/#{category.id}", headers: headers
      }.to change(Category, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end
  end
end
