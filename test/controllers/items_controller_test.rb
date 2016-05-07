require 'test_helper'

class ItemsControllerTest < ActionController::TestCase
  setup do
    @item = items(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:items)
  end

  test "should create item" do
    assert_difference('Item.count') do
      post :create, item: { field1: @item.field1, field2: @item.field2 }
    end

    assert_response 201
  end

  test "should show item" do
    get :show, id: @item
    assert_response :success
  end

  test "should update item" do
    put :update, id: @item, item: { field1: @item.field1, field2: @item.field2 }
    assert_response 204
  end

  test "should destroy item" do
    assert_difference('Item.count', -1) do
      delete :destroy, id: @item
    end

    assert_response 204
  end
end
