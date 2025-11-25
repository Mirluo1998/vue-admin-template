<template>
  <div class="app-container">
    <!-- Search form -->
    <el-form :inline="true" :model="queryParams" size="small" class="demo-form-inline">
      <el-form-item label="用户ID">
        <el-input v-model="queryParams.user_id" placeholder="用户ID" clearable />
      </el-form-item>
      <el-form-item label="订单号">
        <el-input v-model="queryParams.order_no" placeholder="订单号" clearable />
      </el-form-item>
      <el-form-item label="订单类型">
        <el-select v-model="queryParams.order_type" placeholder="请选择" clearable>
          <el-option label="购买知识库" :value="0" />
          <el-option label="购买代理" :value="1" />
          <el-option label="购买服务" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="订单状态">
        <el-select v-model="queryParams.status" placeholder="请选择" clearable>
          <el-option label="待处理" :value="0" />
          <el-option label="处理中" :value="1" />
          <el-option label="已完成" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="fetchData">查询</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- Action buttons -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
    </el-row>

    <!-- Data table -->
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="ID" width="80">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column label="用户ID" width="100" align="center">
        <template slot-scope="scope">
          {{ scope.row.user_id }}
        </template>
      </el-table-column>
      <el-table-column label="订单号" min-width="150">
        <template slot-scope="scope">
          {{ scope.row.order_no }}
        </template>
      </el-table-column>
      <el-table-column label="金额" width="120" align="right">
        <template slot-scope="scope">
          <span style="color: #f56c6c; font-weight: bold;">¥{{ scope.row.amount.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单类型" width="120" align="center">
        <template slot-scope="scope">
          <el-tag :type="getOrderTypeTag(scope.row.order_type)">
            {{ getOrderTypeText(scope.row.order_type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="getStatusTag(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" width="180">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.created_at }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleEdit(scope.row)"
          >编辑</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            style="color: #f56c6c;"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <el-pagination
      style="margin-top: 20px;"
      :current-page="queryParams.page"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="queryParams.size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- Add/Edit dialog -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户ID" prop="user_id">
          <el-input v-model.number="form.user_id" placeholder="请输入用户ID" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="订单号" prop="order_no">
          <el-input v-model="form.order_no" placeholder="请输入订单号" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input-number v-model="form.amount" :precision="2" :step="0.01" :min="0" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="订单类型" prop="order_type">
          <el-select v-model="form.order_type" placeholder="请选择订单类型" style="width: 100%;">
            <el-option label="购买知识库" :value="0" />
            <el-option label="购买代理" :value="1" />
            <el-option label="购买服务" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择订单状态" style="width: 100%;">
            <el-option label="待处理" :value="0" />
            <el-option label="处理中" :value="1" />
            <el-option label="已完成" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getOrderList, addOrder, updateOrder, deleteOrder } from '@/api/user-order'

export default {
  name: 'UserOrder',
  data() {
    return {
      // Loading state
      listLoading: true,
      // Data list
      list: [],
      // Total count
      total: 0,
      // Query parameters
      queryParams: {
        page: 1,
        size: 10,
        user_id: null,
        order_no: null,
        order_type: null,
        status: null
      },
      // Dialog visibility
      dialogVisible: false,
      // Dialog title
      dialogTitle: '',
      // Is edit mode
      isEdit: false,
      // Form data
      form: {},
      // Form validation rules
      rules: {
        user_id: [
          { required: true, message: '用户ID不能为空', trigger: 'blur' },
          { type: 'number', message: '用户ID必须为数字', trigger: 'blur' }
        ],
        order_no: [
          { required: true, message: '订单号不能为空', trigger: 'blur' }
        ],
        amount: [
          { required: true, message: '金额不能为空', trigger: 'blur' }
        ],
        order_type: [
          { required: true, message: '请选择订单类型', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择订单状态', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    // Fetch order list
    fetchData() {
      this.listLoading = true
      getOrderList(this.queryParams).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    // Reset query form
    resetQuery() {
      this.queryParams = {
        page: 1,
        size: 10,
        user_id: null,
        order_no: null,
        order_type: null,
        status: null
      }
      this.fetchData()
    },
    // Reset form
    resetForm() {
      this.form = {
        user_id: null,
        order_no: '',
        amount: 0,
        order_type: 0,
        status: 0
      }
    },
    // Handle add button
    handleAdd() {
      this.resetForm()
      this.isEdit = false
      this.dialogTitle = '新增订单'
      this.dialogVisible = true
    },
    // Handle edit button
    handleEdit(row) {
      this.form = { ...row }
      this.isEdit = true
      this.dialogTitle = '编辑订单'
      this.dialogVisible = true
    },
    // Handle delete button
    handleDelete(row) {
      this.$confirm('确认删除该订单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteOrder(row.id).then(() => {
          this.$message.success('删除成功')
          this.fetchData()
        })
      }).catch(() => {})
    },
    // Cancel dialog
    cancel() {
      this.dialogVisible = false
      this.resetForm()
    },
    // Submit form
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.isEdit) {
            // Update order
            const updateData = {
              amount: this.form.amount,
              order_type: this.form.order_type,
              status: this.form.status
            }
            updateOrder(this.form.id, updateData).then(() => {
              this.$message.success('更新成功')
              this.dialogVisible = false
              this.fetchData()
            })
          } else {
            // Add order
            addOrder(this.form).then(() => {
              this.$message.success('添加成功')
              this.dialogVisible = false
              this.fetchData()
            })
          }
        }
      })
    },
    // Handle page size change
    handleSizeChange(val) {
      this.queryParams.size = val
      this.fetchData()
    },
    // Handle current page change
    handleCurrentChange(val) {
      this.queryParams.page = val
      this.fetchData()
    },
    // Get order type text
    getOrderTypeText(type) {
      const typeMap = {
        0: '购买知识库',
        1: '购买代理',
        2: '购买服务'
      }
      return typeMap[type] || '未知'
    },
    // Get order type tag color
    getOrderTypeTag(type) {
      const tagMap = {
        0: '',
        1: 'success',
        2: 'warning'
      }
      return tagMap[type] || 'info'
    },
    // Get status text
    getStatusText(status) {
      const statusMap = {
        0: '待处理',
        1: '处理中',
        2: '已完成'
      }
      return statusMap[status] || '未知'
    },
    // Get status tag color
    getStatusTag(status) {
      const tagMap = {
        0: 'info',
        1: 'warning',
        2: 'success'
      }
      return tagMap[status] || 'info'
    }
  }
}
</script>

<style scoped lang="scss">
.mb8 {
  margin-bottom: 8px;
}
</style>

