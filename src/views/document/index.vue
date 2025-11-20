<template>
  <div class="app-container">
    <el-form :inline="true" :model="queryParams" size="small" class="demo-form-inline">
      <el-form-item label="文件名">
        <el-input v-model="queryParams.file_name" placeholder="文件名" />
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
      <el-table-column label="知识库ID">
        <template slot-scope="scope">
          {{ scope.row.knowledge_id }}
        </template>
      </el-table-column>
      <el-table-column label="文件名" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.file_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Pageviews" align="center">
        <template slot-scope="scope">
          {{ scope.row.pageviews }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="Status" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="Display_time" width="200">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.created_at }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template v-if="scope.row.userId !== 1" slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleTraining(scope.row)">训练</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改知识库对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="知识库ID" prop="knowledgeId">
          <el-input v-model="form.knowledge_id" placeholder="请输入知识库ID" />
        </el-form-item>
        <el-form-item label="" prop="workSpaceId">
          <el-upload
            class="upload-demo"
            drag
            :action="uploadConfig.url"
            :headers="uploadConfig.headers"
            :on-success="handleUploadSuccess"
            multiple
          >
            <i class="el-icon-upload" />
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
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
import { getList, add, training } from '@/api/document'
import AgentWidget from '@/components/AgentWidget'

export default {
  components: {
    AgentWidget
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      open: false,
      form: {},
      training_params: {
        doc_id: null
      },
      title: '添加知识库',
      uploadConfig: {
        url: process.env.VUE_APP_BASE_API + '/document/upload',
        headers: {
          Authorization: this.$store.getters.token
        }
      },
      queryParams: {
        file_name: null,
        knowledge_id: null,
        status: null
      },
      list: null,
      listLoading: true,
      rules: {
        knowledge_id: [
          { required: true, message: '知识库ID不能为空', trigger: 'blur' }
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
    handleUploadSuccess(response, file, fileList) {
      this.form.file_name = file.name
      this.form.file_path = response.data
      this.form.file_type = '1'
    },
    async handleTraining(row) {
      this.training_params.doc_id = row.id
      await training(this.training_params)
      this.$notify.success({
        title: '成功',
        message: '开始训练'
      })
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
