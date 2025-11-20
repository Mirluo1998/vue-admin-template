<template>
  <div class="app-container">
    <el-form :inline="true" :model="queryParams" size="small" class="demo-form-inline">
      <el-form-item label="用户名">
        <el-input v-model="queryParams.username" placeholder="用户名" />
      </el-form-item>
      <el-form-item label="用户邮箱">
        <el-input v-model="queryParams.email" placeholder="用户邮箱" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="fetchData">查询</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增
        </el-button>
      </el-col>
    </el-row>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column label="用户名">
        <template slot-scope="scope">
          {{ scope.row.username }}
        </template>
      </el-table-column>
      <el-table-column label="用户邮箱" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.email }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="Display_time" width="200">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.created_at }}</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改知识库对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="用户邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入用户邮箱" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" placeholder="请输入密码" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <!-- Agent 测试挂件组件，可在任意页面复用 -->
    <agent-widget />
  </div>
</template>

<script>
import { getList, add } from '@/api/user'

export default {
  data() {
    return {
      open: false,
      form: {},
      title: '添加用户',
      queryParams: {
        username: null,
        email: null
      },
      list: null,
      listLoading: true,
      rules: {
        username: [
          { required: true, message: '用户名不能为空', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '密码不能为空', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '邮箱不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getList(this.queryParams).then(response => {
        this.list = response.data.items
        this.listLoading = false
      })
    },
    handleAdd() {
      this.open = true
    },
    cancel() {
      this.open = false
    },
    submitForm() {
      add(this.form).then(
        () => {
          this.open = false
          this.fetchData()
          this.$notify.success({
            title: '成功',
            message: '添加成功'
          })
        }
      )
    }
  }
}
</script>

<style scoped lang="scss">

</style>
