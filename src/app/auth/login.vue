<script setup>
import { ref, inject, reactive, computed, watch, onMounted } from 'vue'
import { isMobile, isEnterprise } from '@/utils'
import { routeTo } from '@/router'
import { sendVerificationCode } from '@/api/auth'
import { useProjectStore } from '@/store/modules/project'
import { useAuthStore } from '@/store/modules/auth'
import { useRememberStore } from '@/store/modules/remember'
const { APP_CONFIG_DEBUG_KEY } = import.meta.env

const isRegisterEnable = computed(() => {
  return useProjectStore().isRegisterEnable
})

const { LoginType, Image } = inject('Constant')

const formRef = ref(null)

const verificationCodeRef = ref(null)

const ClientName = import.meta.env[isEnterprise ? 'ENTERPRISE_APP_NAME' : 'MECHANISM_APP_NAME']

const formRules = {
  mobile: [{ required: true, message: '请输入手机号码' }, isMobile],
  password: [{ required: true, message: '请输入密码' }],
  verificationCode: [
    { required: true, message: '请输入验证码' },
    { min: 4, max: 4, message: '请输入正确的验证码' }
  ]
}
const type = ref(LoginType.PASSWORD)

const data = reactive({
  remember: true,
  formData: {
    mobile: '',
    password: '',
    verificationCode: ''
  },
  verificationCodeText: ''
})

const otherType = computed(() => {
  return type.value === LoginType.SMS ? LoginType.PASSWORD : LoginType.SMS
})

onMounted(() => {
  const { mobile, password } = useRememberStore()
  data.formData.mobile = mobile ?? ''
  data.formData.password = password ?? ''
})

watch(type, value => {
  if (value === LoginType.PASSWORD) {
    data.formData.verificationCode = ''
  } else {
    data.formData.password = ''
  }
})

const onWatchPhoneInput = value => {
  if (value !== APP_CONFIG_DEBUG_KEY) {
    return
  }

  uni.showModal({
    title: '即将进入调试配置页',
    content: '请确认是否继续',
    success: res => {
      if (res.cancel) {
        return
      } else if (res.confirm) {
        uni.navigateTo({ name: 'Config' })
      }
    },
    complete: () => {
      data.formData.mobile = ''
    }
  })
}

const onClickProtocol = () => {
  data.remember = !data.remember
}

const getVerificationCode = async () => {
  let result = await formRef.value.validator(['mobile'])
  if (!result || !verificationCodeRef.value.active) {
    return
  }

  try {
    let res = await sendVerificationCode({ mobile: data.formData.mobile, typeEnum: 'PROJECT_LOGIN' })
    if (!res) {
      throw new Error('验证码获取失败')
    }
    verificationCodeRef.value.start()
  } catch (error) {
    verificationCodeRef.value.reset()
  }
}

const onLogin = async () => {
  try {
    if (data.isLoading) {
      return
    }

    data.isLoading = true

    let result = false
    if (type.value === LoginType.PASSWORD) {
      result = await formRef.value.validator(['mobile', 'password'])
    } else {
      result = await formRef.value.validator(['mobile', 'verificationCode'])
    }
    if (!result) {
      console.log(result)
      throw new Error('校验失败')
    }
    let res = await useAuthStore().onLogin({ ...data.formData, type: type.value, remember: data.remember })

    if (!res) {
      throw new Error('登录失败')
    }

    if (res.count === 1) {
      uni.switchTab({ name: 'Dashboard' })
    } else {
      uni.navigateTo({ name: 'EnterpriseSelect', passedParams: { mobile: data.formData.mobile } })
    }
  } catch (error) {
    console.log(error.message)
  } finally {
    data.isLoading = false
  }
}
</script>

<template>
  <view class="login-page">
    <view class="meta">
      <image class="logo" mode="aspectFit" :src="Image.Logo" />
      <text class="name" v-text="ClientName" />
    </view>
    <view class="form">
      <g-form :model="data.formData" ref="formRef" :rules="formRules">
        <g-form-item label="手机号码" prop="mobile">
          <g-input
            v-model="data.formData.mobile"
            placeholder="请输入手机号码"
            :maxlength="11"
            :minlength="11"
            @input="onWatchPhoneInput"
          >
          </g-input>
        </g-form-item>
        <template v-if="type === LoginType.PASSWORD">
          <g-form-item label="密码" prop="password">
            <g-input v-model="data.formData.password" placeholder="请输入密码" password> </g-input>
          </g-form-item>
        </template>
        <template v-else-if="type === LoginType.SMS">
          <g-form-item label="验证码" prop="verificationCode" :real-time-validate="false">
            <g-input v-model="data.formData.verificationCode" placeholder="请输入验证码" :maxlength="4" :minlength="4">
              <fui-tag type="primary" theme="plain" :scaleRatio="0.9" @click="getVerificationCode">
                {{ data.verificationCodeText }}
              </fui-tag>
            </g-input>
          </g-form-item>
        </template>
        <g-verification-code
          keep-running
          unique-key="login-page"
          ref="verificationCodeRef"
          @change="value => (data.verificationCodeText = value)"
        />
      </g-form>
      <view class="protocol" @tap.catch="onClickProtocol">
        <fui-icon
          class="icon"
          :class="[{ active: data.remember }]"
          :name="data.remember ? 'checkbox-fill' : 'checkround'"
        />
        <text class="text" :class="[{ active: data.remember }]"> 记住登录信息 </text>
      </view>

      <view class="submit">
        <fui-button class="button" :loading="data.isLoading" :disabled="data.isLoading" @tap="onLogin"
          >立即登录</fui-button
        >
      </view>

      <view class="action">
        <view @tap="() => (type = otherType)">{{ otherType }}</view>
        <view data-name="ForgetPassword" @tap.stop="routeTo">忘记密码</view>
      </view>

      <view v-if="isRegisterEnable" class="register" data-name="Register" @tap.stop="routeTo">
        <text>快速注册账号</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.login-page {
  @apply h-[100vh] bg-white;
  .meta {
    @apply ml-6 mr-6 mb-6 pt-20 pb-3 flex items-center text-2xl font-medium text-color-primary;
    .logo {
      @apply mr-2 w-8 h-8 shadow-md rounded-lg;
    }
  }
  .form {
    .protocol {
      @apply ml-6 mr-6 mt-3 mb-3 text-sm;
      .icon {
        @apply align-text-bottom text-base text-color-extra #{!important};
        &.active {
          @apply text-primary #{!important};
        }
      }
      .text {
        @apply align-text-bottom text-sm leading-6 text-color-extra #{!important};
        &.active {
          @apply text-color-primary #{!important};
        }
      }
    }

    .action {
      @apply ml-6 mr-6 mt-2 flex items-center justify-between;
      @apply text-sm;
    }
    .submit {
      @apply mt-3 ml-6 mr-6 mb-3;
    }

    .register {
      @apply mt-12  w-full text-center text-sm text-primary;
    }
  }
}
</style>
