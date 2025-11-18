import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/document/document_list',
    method: 'get',
    params
  })
}

export function add(params) {
  return request({
    url: '/document/document_add',
    method: 'post',
    params
  })
}

export function training(params) {
  return request({
    url: '/document/training',
    method: 'get',
    params
  })
}

export function agent_chat(params) {
  return request({
    url: '/agent/chat',
    method: 'get',
    params
  })
}
