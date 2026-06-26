<template>
  <div class="page-container">
    <div class="sticky top-0 z-10 -mx-4 -mt-4 mb-6 bg-gray-50 px-4 pb-3 pt-4 dark:bg-gray-900">
      <div class="mb-4 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">服务器资产</h1>
        <app-button variant="primary" size="sm" @click="openCreate">
          <span class="i-carbon-add"></span>
          新增服务器
        </app-button>
      </div>

      <!-- 搜索栏 -->
      <app-card>
        <div class="flex flex-wrap gap-3">
          <div class="w-48">
            <app-input v-model="searchIp" placeholder="搜索 IP 地址" :clearable="true">
              <template #prefix>
                <span class="i-carbon-search"></span>
              </template>
            </app-input>
          </div>
          <div class="w-48">
            <app-input v-model="searchName" placeholder="搜索主机别名" :clearable="true">
              <template #prefix>
                <span class="i-carbon-search"></span>
              </template>
            </app-input>
          </div>
          <app-button variant="default" size="sm" @click="loadData">
            <span class="i-carbon-search"></span>
            查询
          </app-button>
        </div>
      </app-card>
    </div>

    <!-- 数据表格 -->
    <app-card>
      <app-table
        :columns="columns"
        :data="tableData"
        :loading="loading"
        empty-text="暂无服务器数据"
      >
        <template #cell-hostIp="{ value }">
          <code class="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono dark:bg-gray-700">{{
            value
          }}</code>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex items-center gap-1">
            <app-button variant="text" size="sm" @click="openEdit(row)">
              <span class="i-carbon-edit"></span>
            </app-button>
            <app-button variant="text" size="sm" @click="handleDelete(row)">
              <span class="i-carbon-trash-can text-red-500"></span>
            </app-button>
          </div>
        </template>
      </app-table>
    </app-card>

    <!-- 新增/编辑弹窗 -->
    <app-modal
      :visible="modalVisible"
      :title="editingId ? '编辑服务器' : '新增服务器'"
      :loading="submitting"
      @confirm="handleSubmit"
      @cancel="closeModal"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >服务器 IP</label
            >
            <app-input v-model="form.hostIp" placeholder="如: 192.168.1.10" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >主机别名</label
            >
            <app-input v-model="form.hostName" placeholder="如: prod-web-01" />
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >SSH 端口</label
            >
            <app-input v-model="form.sshPortStr" placeholder="22" type="number" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >SSH 用户名</label
            >
            <app-input v-model="form.sshUsername" placeholder="如: opsadmin" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Exporter 端口</label
            >
            <app-input v-model="form.nodeExporterPortStr" placeholder="9100" type="number" />
          </div>
        </div>
        <div v-if="!editingId">
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >SSH 密码</label
          >
          <app-input v-model="form.sshPassword" type="password" placeholder="请输入 SSH 密码" />
        </div>
        <p v-else class="text-xs text-gray-400">编辑模式下不修改密码，如需修改请单独操作</p>
      </div>
    </app-modal>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@/components/ui/AppTable.vue'
import { MESSAGE_KEY } from '@/composables/useMessage'
import type { MessageInstance } from '@/composables/useMessage'
import { DIALOG_KEY } from '@/composables/useDialog'
import type { DialogInstance } from '@/composables/useDialog'

const message = inject<MessageInstance>(MESSAGE_KEY)!
const dialog = inject<DialogInstance>(DIALOG_KEY)!

const columns: TableColumn[] = [
  { key: 'hostIp', title: 'IP 地址', width: '150px' },
  { key: 'hostName', title: '主机别名' },
  { key: 'sshPort', title: 'SSH 端口', width: '90px' },
  { key: 'sshUsername', title: 'SSH 用户', width: '110px' },
  { key: 'nodeExporterPort', title: 'Exporter', width: '90px' },
  { key: 'actions', title: '操作', width: '90px' },
]

const loading = ref(false)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tableData = ref<any[]>([])
const searchIp = ref('')
const searchName = ref('')

const modalVisible = ref(false)
const editingId = ref('')
const submitting = ref(false)

const emptyForm = () => ({
  hostIp: '',
  hostName: '',
  sshPortStr: '22',
  sshUsername: '',
  sshPassword: '',
  nodeExporterPortStr: '9100',
})

const form = reactive(emptyForm())

function openCreate() {
  editingId.value = ''
  Object.assign(form, emptyForm())
  modalVisible.value = true
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function openEdit(row: any) {
  editingId.value = row.id
  Object.assign(form, {
    hostIp: row.hostIp || '',
    hostName: row.hostName || '',
    sshPortStr: String(row.sshPort || 22),
    sshUsername: row.sshUsername || '',
    sshPassword: '',
    nodeExporterPortStr: String(row.nodeExporterPort || 9100),
  })
  modalVisible.value = true
}

function closeModal() {
  modalVisible.value = false
}

async function handleSubmit() {
  if (!form.hostIp || !form.hostName) {
    message.warning('请填写必填字段')
    return
  }
  submitting.value = true
  try {
    const payload = {
      hostIp: form.hostIp,
      hostName: form.hostName,
      sshPort: Number(form.sshPortStr) || 22,
      sshUsername: form.sshUsername,
      nodeExporterPort: Number(form.nodeExporterPortStr) || 9100,
      sshPassword: undefined as string | undefined,
    }
    if (!editingId.value) {
      payload.sshPassword = form.sshPassword
    }
    if (editingId.value) {
      await Apis.asset.update_1({ data: { id: editingId.value, ...payload } }).send()
      message.success('更新成功')
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await Apis.asset.create_1({ data: payload as any }).send()
      message.success('创建成功')
    }
    closeModal()
    await loadData()
  } catch (e: unknown) {
    message.error((e as { message?: string }).message || '操作失败')
  } finally {
    submitting.value = false
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleDelete(row: any) {
  dialog.show({
    title: '删除服务器',
    content: `确定要删除服务器「${row.hostName} (${row.hostIp})」吗？此操作不可撤销。`,
    type: 'danger',
    async onConfirm() {
      try {
        await Apis.asset.delete_1({ pathParams: { id: Number(row.id.replace('srv-', '')) } }).send()
        message.success('删除成功')
        await loadData()
      } catch (e: unknown) {
        message.error((e as { message?: string }).message || '删除失败')
      }
    },
  })
}

async function loadData() {
  loading.value = true
  try {
    const res = await Apis.asset
      .list_1({
        params: {
          hostIp: searchIp.value || undefined,
          hostName: searchName.value || undefined,
        },
      })
      .send()
    tableData.value = res.data || []
  } catch {
    tableData.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => loadData())
</script>
