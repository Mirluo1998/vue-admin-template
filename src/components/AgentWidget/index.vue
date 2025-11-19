<template>
  <div class="agent-widget" :class="{ 'is-open': agentWidget.visible }">
    <div class="agent-widget-toggle" @click="toggleAgentWidget">
      <i class="el-icon-chat-line-round" />
      <span class="agent-widget-toggle-text">{{ title }}</span>
    </div>
    <transition name="el-fade-in">
      <div v-show="agentWidget.visible" class="agent-widget-panel">
        <div class="agent-widget-header">
          <span>{{ title }}</span>
          <i class="el-icon-close agent-widget-close" @click.stop="closeAgentWidget" />
        </div>
        <div class="agent-widget-body">
          <div ref="agentScrollArea" class="agent-message-list">
            <div
              v-for="(msg, index) in agentWidget.messages"
              :key="index"
              :class="['agent-message', msg.role]"
            >
              <div class="agent-message-meta">
                <span class="agent-message-role">{{ msg.role === 'user' ? '我' : 'Agent' }}</span>
              </div>
              <div class="agent-message-content">
                {{ msg.content }}
              </div>
            </div>
          </div>
        </div>
        <div class="agent-widget-footer">
          <el-input
            v-model="agentWidget.input"
            type="textarea"
            :rows="2"
            class="agent-widget-input"
            placeholder="请输入要发送给 Agent 的内容，回车发送"
            @keyup.enter.native="sendAgentMessage"
          />
          <div class="agent-widget-actions">
            <el-button
              type="primary"
              size="mini"
              :loading="agentWidget.loading"
              @click="sendAgentMessage"
            >发送</el-button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { EventSourcePolyfill } from 'event-source-polyfill'
import { getToken } from '@/utils/auth'

export default {
  name: 'AgentWidget',
  props: {
    // widget title text
    title: {
      type: String,
      default: 'Agent 测试'
    }
  },
  data() {
    return {
      // agent widget state
      agentWidget: {
        visible: false,
        loading: false,
        input: '',
        messages: [],
        eventSource: null
      }
    }
  },
  methods: {
    // toggle agent widget open/close
    toggleAgentWidget() {
      this.agentWidget.visible = !this.agentWidget.visible
      if (this.agentWidget.visible) {
        this.$nextTick(() => {
          this.scrollAgentToBottom()
        })
      }
    },
    // close agent widget
    closeAgentWidget() {
      this.agentWidget.visible = false
      // english comments only:
      // close existing EventSource connection when widget is closed
      if (this.agentWidget.eventSource) {
        this.agentWidget.eventSource.close()
        this.agentWidget.eventSource = null
      }
    },
    // scroll agent message list to bottom
    scrollAgentToBottom() {
      const container = this.$refs.agentScrollArea
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    // send message to agent backend with SSE streaming
    sendAgentMessage() {
      if (!this.agentWidget.input || this.agentWidget.loading) {
        return
      }
      const content = this.agentWidget.input.trim()
      if (!content) {
        return
      }
      // push user message to local list
      this.agentWidget.messages.push({
        role: 'user',
        content
      })
      this.agentWidget.input = ''
      this.agentWidget.loading = true
      this.$nextTick(() => {
        this.scrollAgentToBottom()
      })
      // english comments only:
      // prepare placeholder for streaming agent message
      const agentMsg = {
        role: 'agent',
        content: ''
      }
      this.agentWidget.messages.push(agentMsg)
      const agentIndex = this.agentWidget.messages.length - 1

      // close previous EventSource if exists
      if (this.agentWidget.eventSource) {
        this.agentWidget.eventSource.close()
        this.agentWidget.eventSource = null
      }

      const baseUrl = process.env.VUE_APP_BASE_API || ''
      const url = `${baseUrl}/agent/chat/stream?question=${encodeURIComponent(content)}`

      try {
        const token = getToken()
        const headers = token
          ? {
            Authorization: `${token}`
          }
          : {}
        const es = new EventSourcePolyfill(url, {
          headers,
          withCredentials: true
        })
        this.agentWidget.eventSource = es
        let firstChunk = true

        es.onmessage = (event) => {
          // english comments only:
          // parse SSE payload, which is R.success(data) from backend
          try {
            const payload = JSON.parse(event.data || '{}')
            const delta = payload.data || ''
            if (!delta) return

            if (firstChunk) {
              this.agentWidget.loading = false
              firstChunk = false
            }

            agentMsg.content += delta
            this.$set(this.agentWidget.messages, agentIndex, { ...agentMsg })
            this.$nextTick(() => {
              this.scrollAgentToBottom()
            })
          } catch (e) {
            // swallow parse errors but close stream
            console.error('Failed to parse SSE message', e)
            this.agentWidget.loading = false
            es.close()
            this.agentWidget.eventSource = null
          }
        }

        es.onerror = () => {
          // english comments only:
          // stop loading state and close EventSource on error/complete
          this.agentWidget.loading = false
          if (this.agentWidget.eventSource) {
            this.agentWidget.eventSource.close()
            this.agentWidget.eventSource = null
          }
        }
      } catch (e) {
        this.agentWidget.loading = false
        this.agentWidget.messages.push({
          role: 'agent',
          content: '请求 Agent 失败，请检查接口是否可用。'
        })
        this.$nextTick(() => {
          this.scrollAgentToBottom()
        })
      }
    }
  }
}
</script>

<style scoped>
.agent-widget {
  position: fixed;
  top: 120px;
  right: 0;
  z-index: 999;
  display: flex;
  align-items: flex-start;
}

.agent-widget-toggle {
  background-color: #409eff;
  color: #fff;
  padding: 10px 8px;
  border-radius: 6px 0 0 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.agent-widget-toggle-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 12px;
  margin-top: 4px;
}

.agent-widget-panel {
  width: 360px;
  height: 480px;
  background: #fff;
  border-left: 1px solid #ebeef5;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 4px 0 0 4px;
  display: flex;
  flex-direction: column;
}

.agent-widget-header {
  padding: 10px 12px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
}

.agent-widget-close {
  cursor: pointer;
}

.agent-widget-body {
  flex: 1;
  padding: 8px 12px;
  overflow: hidden;
}

.agent-message-list {
  height: 100%;
  overflow-y: auto;
}

.agent-message {
  margin-bottom: 8px;
}

.agent-message.user .agent-message-content {
  background-color: #409eff;
  color: #fff;
  margin-left: auto;
}

.agent-message.agent .agent-message-content {
  background-color: #f2f6fc;
  color: #303133;
  margin-right: auto;
}

.agent-message-meta {
  font-size: 12px;
  color: #909399;
  margin-bottom: 2px;
}

.agent-message-content {
  max-width: 260px;
  padding: 6px 10px;
  border-radius: 4px;
  word-break: break-all;
  white-space: pre-wrap;
}

.agent-widget-footer {
  border-top: 1px solid #ebeef5;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
}

.agent-widget-input {
  margin-bottom: 6px;
}

.agent-widget-actions {
  text-align: right;
}
</style>

