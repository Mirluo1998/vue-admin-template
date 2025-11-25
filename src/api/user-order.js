import request from '@/utils/request'

/**
 * Get user order list with pagination and filters
 * @param {Object} params - Query parameters
 */
export function getOrderList(params) {
  return request({
    url: '/user-order/list',
    method: 'get',
    params: params
  })
}

/**
 * Get user order by ID
 * @param {Number} id - Order ID
 */
export function getOrderById(id) {
  return request({
    url: `/user-order/${id}`,
    method: 'get'
  })
}

/**
 * Get user order by order number
 * @param {String} orderNo - Order number
 */
export function getOrderByNo(orderNo) {
  return request({
    url: `/user-order/no/${orderNo}`,
    method: 'get'
  })
}

/**
 * Create a new user order
 * @param {Object} data - Order data
 */
export function addOrder(data) {
  return request({
    url: '/user-order/add',
    method: 'post',
    data
  })
}

/**
 * Update an existing user order
 * @param {Number} id - Order ID
 * @param {Object} data - Update data
 */
export function updateOrder(id, data) {
  return request({
    url: `/user-order/${id}`,
    method: 'put',
    data
  })
}

/**
 * Delete a user order
 * @param {Number} id - Order ID
 */
export function deleteOrder(id) {
  return request({
    url: `/user-order/${id}`,
    method: 'delete'
  })
}

