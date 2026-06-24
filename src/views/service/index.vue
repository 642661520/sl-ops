<template>
  <div class="page-container">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">服务管理</h1>
      <app-button variant="primary" size="sm" @click="openCreate">
        <span class="i-carbon-add"></span>
        新增服务
      </app-button>
    </div>

    <!-- 搜索栏 -->
    <app-card class="mb-6">
      <div class="flex flex-wrap gap-3">
        <div class="w-56">
          <app-input v-model="searchName" placeholder="搜索服务名称" :clearable="true">
            <template #prefix>
              <span class="i-carbon-search"></span>
            </template>
          </app-input>
        </div>
        <div class="w-40">
          <app-select v-model="searchType" :options="typeOptions" placeholder="服务类型" />
        </div>
        <app-button variant="default" size="sm" @click="loadData">
          <span class="i-carbon-search"></span>
          查询
        </app-button>
      </div>
    </app-card>

    <!-- 数据表格 -->
    <app-card>
      <app-table :columns="columns" :data="tableData" :loading="loading" empty-text="暂无服务数据">
        <template #cell-serviceType="{ value }">
          <app-tag :type="getTypeTag(value as string)">
            {{ getTypeLabel(value as string) }}
          </app-tag>
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
      :title="editingId ? '编辑服务' : '新增服务'"
      :loading="submitting"
      @confirm="handleSubmit"
      @cancel="closeModal"
    >
      <div class="space-y-4">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >服务名称</label
          >
          <app-input v-model="form.serviceName" placeholder="请输入服务名称" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >服务类型</label
          >
          <app-select
            v-model="form.serviceType"
            :options="typeOptions"
            placeholder="请选择服务类型"
          />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >所属服务器</label
          >
          <app-select v-model="form.serverId" :options="serverOptions" placeholder="请选择服务器" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >描述</label
          >
          <app-input v-model="form.description" placeholder="请输入服务描述" />
        </div>

        <!-- Custom 类型命令 -->
        <template v-if="form.serviceType === 'custom'">
          <div
            class="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800/50"
          >
            <p class="mb-3 text-xs font-medium text-gray-500">自定义命令</p>
            <div class="space-y-3">
              <div>
                <label class="mb-1 block text-xs text-gray-500">启动命令</label>
                <app-input
                  v-model="form.startCommand"
                  placeholder="如: systemctl start myservice"
                />
              </div>
              <div>
                <label class="mb-1 block text-xs text-gray-500">停止命令</label>
                <app-input v-model="form.stopCommand" placeholder="如: systemctl stop myservice" />
              </div>
              <div>
                <label class="mb-1 block text-xs text-gray-500">重启命令</label>
                <app-input
                  v-model="form.restartCommand"
                  placeholder="如: systemctl restart myservice"
                />
              </div>
              <div>
                <label class="mb-1 block text-xs text-gray-500">状态命令</label>
                <app-input
                  v-model="form.statusCommand"
                  placeholder="如: systemctl status myservice"
                />
              </div>
            </div>
          </div>
        </template>
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

// 表格
const columns: TableColumn[] = [
  { key: 'serviceName', title: '服务名称' },
  { key: 'serviceType', title: '服务类型', width: '100px' },
  { key: 'description', title: '描述' },
  { key: 'serverId', title: '所属服务器', width: '130px' },
  { key: 'actions', title: '操作', width: '90px' },
]

const loading = ref(false)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tableData = ref<any[]>([])

const searchName = ref('')
const searchType = ref('')
const typeOptions = [
  { label: 'Docker', value: 'docker' },
  { label: 'Systemctl', value: 'systemctl' },
  { label: 'Custom', value: 'custom' },
]

function getTypeLabel(type: string) {
  const map: Record<string, string> = { docker: 'Docker', systemctl: 'Systemctl', custom: 'Custom' }
  return map[type] || type
}

function getTypeTag(type: string) {
  const map: Record<string, string> = { docker: 'info', systemctl: 'success', custom: 'warning' }
  return (map[type] || 'info') as 'info' | 'success' | 'warning' | 'danger'
}

// 弹窗
const modalVisible = ref(false)
const editingId = ref('')
const submitting = ref(false)

const emptyForm = () => ({
  serviceName: '',
  serviceType: 'docker',
  serverId: '',
  description: '',
  startCommand: '',
  stopCommand: '',
  restartCommand: '',
  statusCommand: '',
})

const form = reactive(emptyForm())

// 服务器选项
const serverOptions = ref<{ label: string; value: string }[]>([])

function openCreate() {
  editingId.value = ''
  Object.assign(form, emptyForm())
  modalVisible.value = true
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function openEdit(row: any) {
  editingId.value = row.id
  Object.assign(form, {
    serviceName: row.serviceName || '',
    serviceType: row.serviceType || 'docker',
    serverId: row.serverId || '',
    description: row.description || '',
    startCommand: row.startCommand || '',
    stopCommand: row.stopCommand || '',
    restartCommand: row.restartCommand || '',
    statusCommand: row.statusCommand || '',
  })
  modalVisible.value = true
}

function closeModal() {
  modalVisible.value = false
}

async function handleSubmit() {
  if (!form.serviceName) {
    message.warning('请输入服务名称')
    return
  }
  submitting.value = true
  try {
    if (editingId.value) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await Apis.service.update({ data: { id: editingId.value, ...form } as any }).send()
      message.success('更新成功')
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await Apis.service.create({ data: form as any }).send()
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
    title: '删除服务',
    content: `确定要删除服务「${row.serviceName}」吗？此操作不可撤销。`,
    type: 'danger',
    async onConfirm() {
      try {
        await Apis.service
          .delete_({ pathParams: { id: Number(row.id.replace('svc-', '')) } })
          .send()
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
    const res = await Apis.service
      .list({
        params: {
          serviceName: searchName.value || undefined,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          serviceType: (searchType.value || undefined) as any,
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

async function loadServers() {
  try {
    const res = await Apis.asset.list_1({ params: {} }).send()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    serverOptions.value = (res.data || []).map((s: any) => ({
      label: `${s.hostName} (${s.hostIp})`,
      value: s.id,
    }))
  } catch {
    // mock
  }
}

onMounted(() => {
  loadData()
  loadServers()
})
</script>
