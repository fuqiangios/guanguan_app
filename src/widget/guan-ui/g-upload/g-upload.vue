<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { inject, computed, reactive, toRefs, watch } from 'vue'
import { isObject, has, isEmpty, isFunction, random } from 'lodash'
import { isH5, sleep, showActionSheet, onChooseImage, onChooseVideo } from '../utils'

const gFormItem = inject('gFormItem')

const validateError = computed(() => {
  return (gFormItem ? gFormItem.validateState : '') === 'error'
})

const onFileUpload = inject('onFileUpload')

const onFileDelete = inject('onFileDelete')

const TYPE_ENUM = Object.freeze({
  IMAGE: 'image',
  VIDEO: 'video',
  ALL: 'none'
})

const FILE_TYPE_ENUM = Object.freeze({
  IMAGE: ['jpeg', 'jpg', 'png', 'gif', 'svg', 'bmp'],
  VIDEO: ['mp4', 'flv', 'm3u8']
})

const STATUS_ENUM = Object.freeze({
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
})

const ACTION_SHEET_ENUM = Object.freeze({
  album: ['选择图片文件', '选择视频文件'],
  camera: ['拍照', '录像']
})

const props = defineProps({
  filter: {
    type: String,
    default: 'image',
    validator: val => {
      return ['image', 'video', 'none'].includes(val)
    }
  },
  compressed: {
    type: Boolean,
    default: true
  },
  maxDuration: {
    type: Number,
    default: 60
  },
  camera: {
    type: String,
    default: 'back'
  },
  fileList: {
    type: Array,
    default() {
      return []
    }
  },
  suffix: {
    type: Array,
    default() {
      return []
    }
  },
  size: {
    type: [Number, String],
    default: 3
  },
  max: {
    type: [Number, String],
    default: 6
  },
  sizeType: {
    type: Array,
    default() {
      return ['original', 'compressed']
    }
  },
  sourceType: {
    type: Array,
    default() {
      return [
        {
          label: '从相册选择',
          source: 'album'
        },
        {
          label: '拍摄',
          source: 'camera'
        }
      ]
    }
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const { fileList } = toRefs(props)

const emit = defineEmits(['change'])

const data = reactive({
  itemList: [],
  status: []
})

const videoContext = reactive({
  videoId: `video-${random(88, 997)}`,
  controller: null,
  isPreviewVideo: false
})

const { isPreviewVideo } = toRefs(videoContext)

const getStatus = () => {
  if (isEmpty(data.status)) {
    return ''
  }
  let status = STATUS_ENUM.SUCCESS

  status = data.status.includes(STATUS_ENUM.LOADING) ? STATUS_ENUM.LOADING : STATUS_ENUM.SUCCESS
  if (status !== STATUS_ENUM.LOADING && data.status.includes(STATUS_ENUM.ERROR)) {
    status = STATUS_ENUM.ERROR
  }

  return status
}

const onInit = (files = []) => {
  let status = []

  files = files.map(file => {
    status.push(STATUS_ENUM.SUCCESS)
    let path = isObject(file) && has(file, 'path') ? file.path : file

    return {
      path,
      name: isObject(file) && has(file, 'name') ? file.name : '已上传文件',
      size: isObject(file) && has(file, 'size') ? file.size : '0.00Mb',
      suffix: path.split('.')[path.split('.').length - 1].toLocaleLowerCase()
    }
  })
  data.itemList = [...files]
  data.status = status
}

const onSelectMedia = async ({ target }) => {
  if (validateError.value) {
    gFormItem.clearValidate()
  }

  let source = target.dataset.source
  let status = getStatus()
  if (status === STATUS_ENUM.LOADING) {
    uni.showToast({ title: '任务执行中，请稍候', icon: 'none' })
    return
  }
  let result = []
  let count = Number(props.max) - data.itemList.length
  try {
    async function execImageChoose() {
      return await onChooseImage({ sizeType: props.sizeType, count, source })
    }

    async function execVideoChoose() {
      return await onChooseVideo({
        source,
        compressed: props.compressed,
        maxDuration: props.maxDuration,
        camera: props.camera
      })
    }

    let [condition, index] = [false, 0]

    if (props.filter === TYPE_ENUM.ALL) {
      index = await showActionSheet(ACTION_SHEET_ENUM[source], '请选择')
      if (!index) {
        throw new Error('用户取消选择')
      }
      condition = index === 1
    }

    condition = index === 1 || props.filter === TYPE_ENUM.IMAGE
    result = await (condition ? execImageChoose() : execVideoChoose())
  } catch {}

  if (isEmpty(result)) {
    return
  }
  onComputedMedia(result)
}

const onComputedMedia = async mediaFiles => {
  try {
    let tempFiles = []
    let max = Number(props.max)

    mediaFiles.forEach(file => {
      if (data.itemList.length >= max) {
        throw new Error(`最多可上传${max}个文件`)
      }

      let { path, size, name = '本地文件', type = null } = file
      if (isEmpty(path)) {
        return
      }
      let suffix = ''

      if (isH5) {
        suffix = type.split('/')[1]
      } else {
        suffix = path.split('.')[path.split('.').length - 1]
      }

      suffix = suffix.toLocaleLowerCase()

      if (!props.suffix.includes(suffix)) {
        throw new Error(`仅支持 ${props.suffix.join('/')} 格式`)
      }

      if (Number(props.size) * 1024 * 1024 < size) {
        throw new Error(`文件大小不能超过${props.size}Mb`)
      }

      file = {
        path,
        size: `${(size / (1024 * 1024)).toFixed(2)}Mb`,
        name,
        suffix
      }

      tempFiles = [file].concat(tempFiles)
      data.itemList = [file].concat(data.itemList)
      data.status = [STATUS_ENUM.LOADING].concat(data.status)
    })

    if (isFunction(onFileUpload)) {
      tempFiles.forEach(async (file, index) => {
        await onUpload(file, index)
      })
    }
  } catch (error) {
    uni.showToast({ title: error.message, icon: 'none' })
  }
}

const onChange = action => {
  let status = getStatus()
  if (status === STATUS_ENUM.LOADING) {
    return
  }
  emit('change', {
    status: status,
    itemList: data.itemList,
    action
  })
}

const onPreview = ({ currentTarget: { dataset } }, index) => {
  if (isEmpty(data.status)) {
    return
  }

  let { isImage, isVideo } = dataset

  if (!isImage && !isVideo) {
    uni.showToast({ title: '该文件不支持预览', icon: 'none' })
  } else if (isImage) {
    uni.previewImage({
      current: data.itemList[index].path,
      loop: true,
      urls: [data.itemList[index].path]
    })
  } else if (isVideo) {
    videoContext.url = data.itemList[index].path
    sleep(30).then(() => (videoContext.isPreviewVideo = true))
  }
}

const onVideoFullScreen = ({ detail: { fullScreen } }) => {
  if (fullScreen) {
    return
  }
  videoContext.isPreviewVideo = fullScreen
}

const onDelete = async index => {
  if (validateError.value) {
    gFormItem.clearValidate()
  }
  let status = getStatus()
  if (status === STATUS_ENUM.LOADING) {
    uni.showToast({ title: '任务执行中，请稍候', icon: 'none' })
    return
  }
  let lastStatus = data.status[index]
  data.status[index] = STATUS_ENUM.LOADING
  if (isFunction(onFileDelete)) {
    try {
      let result = await onFileDelete(data.itemList[index]?.path ?? data.itemList[index])
      if (!result) {
        throw new Error('接口请求失败')
      }
      data.itemList.splice(index, 1)
      data.status.splice(index, 1)
      onChange('delete')
    } catch (error) {
      data.status[index] = lastStatus
    }
  } else {
    data.itemList.splice(index, 1)
    data.status.splice(index, 1)
    onChange('delete')
  }
}
const onReUpload = async index => {
  if (validateError.value) {
    gFormItem.clearValidate()
  }
  let status = getStatus()
  if (status === STATUS_ENUM.LOADING) {
    uni.showToast({ title: '任务执行中，请稍候', icon: 'none' })
    return
  }

  if (data.status[index] == STATUS_ENUM.SUCCESS) {
    return
  }
  data.status[index] = STATUS_ENUM.LOADING
  let file = data.itemList[index]
  await onUpload(file, index)
}

const onUpload = async (file, index) => {
  try {
    let result = await onFileUpload(file)
    if (!result) {
      throw new Error('接口请求失败')
    }
    data.itemList[index].path = result
    data.status[index] = STATUS_ENUM.SUCCESS
    onChange('upload')
  } catch (error) {
    data.status[index] = STATUS_ENUM.ERROR
  }
}

onLoad(() => {
  onInit(props.fileList)
  sleep(300).then(() => (videoContext.controller = uni.createVideoContext(videoContext.videoId)))
})

watch(fileList, files => {
  onInit(files)
})

watch(isPreviewVideo, state => {
  if (!state) {
    videoContext.controller.pause()
  } else {
    try {
      videoContext.controller.play()
    } catch {}
    sleep(10).then(() => {
      videoContext.controller.requestFullScreen({ direction: 300 })
    })
  }
})
</script>

<template>
  <view class="g-upload">
    <view
      :class="[
        'g-upload__action',
        { error: validateError },
        { 'g-upload__action-hidden': data.itemList.length >= max },
        { 'mb-3': data.itemList.length > 0 && data.itemList.length < max },
        { 'g-upload__action-disabled': disabled }
      ]"
      @tap.stop="onSelectMedia"
    >
      <view
        v-for="item in sourceType"
        :key="item.source"
        class="g-upload__action-item"
        hover-class="hover"
        hover-stay-time="100"
        :data-source="item.source"
        >{{ item.label }}</view
      >
    </view>

    <view :class="['g-upload__wrap', { error: validateError }]">
      <view
        v-for="(item, index) in data.itemList"
        :key="index"
        class="g-upload__item"
        :data-is-image="FILE_TYPE_ENUM.IMAGE.includes(item.suffix)"
        :data-is-video="FILE_TYPE_ENUM.VIDEO.includes(item.suffix)"
        @tap.stop="onPreview($event, index)"
      >
        <template v-if="FILE_TYPE_ENUM.IMAGE.includes(item.suffix)">
          <image class="g-upload__item-image" :src="item.path" mode="aspectFill" />
        </template>
        <template v-else-if="FILE_TYPE_ENUM.VIDEO.includes(item.suffix)">
          <view class="g-upload__item-video">
            <fui-icon custom-prefix="feather" name="icon-video" class="icon" />
          </view>
        </template>
        <template v-else>
          <view class="g-upload__item-unknown">
            <fui-icon custom-prefix="feather" name="icon-file" class="icon" />
          </view>
        </template>
        <view :class="['g-upload__item-info', { error: validateError }]">
          <span class="name truncate">{{ item.name || '未知文件' }}</span>
          <span class="size">{{ item.size || '0.00Mb' }}</span>
        </view>
        <view :class="['g-upload__operation', { error: validateError }]" @tap.stop>
          <template v-if="data.status[index] === STATUS_ENUM.LOADING">
            <view id="loading">
              <fui-icon custom-prefix="feather" name="icon-loader" class="icon" />
            </view>
          </template>
          <template v-else-if="data.status[index] === STATUS_ENUM.ERROR">
            <view id="error" hover-class="hover" hover-stay-time="100" @tap.stop="onReUpload(index)">
              <fui-icon custom-prefix="feather" name="icon-rotate-ccw" class="icon" />
            </view>
          </template>
          <template v-else>
            <view id="remove" hover-class="hover" hover-stay-time="100" v-if="!disabled" @tap.stop="onDelete(index)">
              <fui-icon custom-prefix="feather" name="icon-trash-2" class="icon" />
            </view>
          </template>
        </view>

        <view v-if="!!index" class="divide" />
      </view>
    </view>

    <view class="g-upload__video" v-if="videoContext.url">
      <video
        :id="videoContext?.videoId"
        autoplay
        :class="[{ '!h-0 !w-0': !isPreviewVideo }]"
        @fullscreenchange="onVideoFullScreen"
        class="video"
        :src="videoContext?.url"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
@mixin action {
  @apply w-8 h-8 ml-3 inline-flex items-center justify-center rounded-full;
}
.g-upload {
  &__action {
    @apply w-full flex flex-row items-center rounded-lg paint-contain bg-color-input h-10 box-border transition-all duration-200 ease-in-out;
    @apply divide-x-[1rpx] divide-color-placeholder divide-opacity-20;

    &.error {
      @apply bg-red-100;
      .g-upload__action-item {
        @apply text-red-600;
      }
    }

    &-disabled {
      @apply text-color-placeholder pointer-events-none;
    }

    &-hidden {
      @apply opacity-0 h-0;
    }
    &-item {
      @apply flex-1 text-center p-3 text-sm;
    }
  }

  &__wrap {
    @apply flex flex-col box-border bg-color-input rounded-lg paint-contain;
    &.error {
      @apply bg-red-100;
    }
  }

  &__item {
    @apply relative h-16 flex items-center p-3;

    @if ($isH5) {
      cursor: pointer;
    }

    &-image {
      @apply mr-3 rounded-full w-10 h-10;
    }

    &-video {
      @apply mr-3 rounded-full w-10 h-10 flex items-center justify-center bg-white;
      .icon {
        @apply text-xl text-color-dark #{!important};
      }
    }

    &-unknown {
      @apply mr-3 rounded-full w-10 h-10 flex items-center justify-center bg-white;
      .icon {
        @apply text-xl text-color-upload #{!important};
      }
    }
    &-info {
      @apply flex-1 flex flex-col;

      &.error {
        .name {
          @apply text-red-600;
        }
        .size {
          @apply text-red-400;
        }
      }

      .name {
        @apply text-sm w-44 text-black;
      }
      .size {
        @apply pt-1 text-xs text-color-placeholder;
      }
    }
  }

  &__operation {
    @apply flex justify-end;

    &.error {
      #error {
        .icon {
          @apply text-red-700 #{!important};
        }
      }
    }
    #loading {
      @include action;
      .icon {
        @apply animate-spin h-5 w-5 leading-5 text-xl m-0 text-orange-500 #{!important};
      }
    }
    #error {
      @include action;
      .icon {
        @apply text-xl text-color-extra #{!important};
      }
    }
    #remove {
      @include action;
      @apply bg-red-100;
      .icon {
        @apply text-xl text-red-700 #{!important};
      }
    }
  }

  &__video {
    @apply fixed top-[-2000px] h-0 w-0;
  }
  .divide {
    @apply content-[""] ml-3 absolute top-0 w-full h-[1rpx] bg-color-placeholder opacity-20;
  }
}
</style>
