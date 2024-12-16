<script setup>
import { reactive } from 'vue'
import { useConfigStore } from '@/store/modules/config'
import { storeToRefs } from 'pinia'
import { routeTo } from '@/router'
import EnvOptions from 'env'
import { useProjectStore } from '../../../store/modules/project'

const store = useConfigStore()
const { envName, customEnvData } = storeToRefs(store)

const initialState = reactive({
  current: import.meta.env.APP_ENV,
  env: envName
})

const onRadioChange = async ({
  currentTarget: {
    dataset: { env }
  }
}) => {
  if (env === envName.value) {
    return
  }
  store.onChangeEnv(env)
  uni.showToast({ title: '重新拉取配置中', icon: 'none' })

  let result = await useProjectStore().reload()
  if (!result) {
    store.resetEnv()
    return
  }
  uni.showToast({ title: '环境已切换', icon: 'none' })
}

const onRemove = ({
  currentTarget: {
    dataset: { key }
  }
}) => {
  store.onRemoveEnv(key)
  uni.showToast({ title: `${key} 环境已删除`, icon: 'none' })
}
</script>

<template>
  <g-scroll-view class="env-list-page">
    <template #header>
      <fui-nav-bar is-go-back split-line>
        <template #right>
          <fui-icon custom-prefix="feather" name="icon-plus" data-name="EditEnv" @tap="routeTo" />
        </template>
      </fui-nav-bar>
    </template>

    <fui-list class="menu">
      <view class="cell" v-for="(item, key) in EnvOptions" :key="key">
        <view class="cell-radio" :data-env="key" @tap.stop="onRadioChange">
          <fui-icon class="icon" :name="key === envName ? 'checkbox-fill' : 'checkround'"></fui-icon>
        </view>
        <fui-list-cell class="cell-content" :bottomBorder="false" :data-env="key" @click.stop="onRadioChange">
          <text>{{ item.NAME }}</text>
          <block v-if="key === initialState.current">
            <fui-tag text="默认配置" type="primary" theme="light" :scaleRatio="0.9" />
          </block>
          <block v-else>
            <fui-tag text="内置配置" type="success" theme="light" :scaleRatio="0.9" />
          </block>
        </fui-list-cell>
      </view>

      <view class="cell" v-for="(item, key) in customEnvData" :key="key">
        <view class="cell-radio" :data-env="key" @tap.stop="onRadioChange">
          <fui-icon class="icon" :name="key === envName ? 'checkbox-fill' : 'checkround'"></fui-icon>
        </view>
        <fui-list-cell class="cell-content" :bottomBorder="false" :data-env="key" @click.stop="onRadioChange">
          <text>{{ item.NAME }}</text>
          <view class="operation" :data-env="key" @tap.stop="onRadioChange">
            <view :data-name="`EditEnv?key=${key}`" @tap.stop="routeTo">
              <fui-icon class="icon" custom-prefix="feather" name="icon-edit"></fui-icon>
            </view>
            <view :data-key="key" @tap.stop="onRemove">
              <fui-icon class="icon" custom-prefix="feather" name="icon-trash-2"></fui-icon>
            </view>
          </view>
        </fui-list-cell>
      </view>
    </fui-list>
  </g-scroll-view>
</template>

<style lang="scss" scoped>
.env-list-page {
  .fui-icon {
    @apply text-xl m-3 mt-0 mb-0 #{!important};
  }
  .menu {
    .cell {
      @apply flex items-center mt-3;
      &-radio {
        @apply flex items-center justify-center w-12 h-12;
        .icon {
          @apply text-primary  #{!important};
        }
      }

      &-content {
        @apply relative mr-3 rounded-xl paint-contain #{!important};

        .operation {
          @apply absolute right-3 top-0 bottom-0 flex items-center;
          view {
            @apply w-full h-full inline-flex items-center;

            .icon {
              @apply text-lg text-color-desc  #{!important};
            }
          }
        }
      }
    }
  }
}
</style>
