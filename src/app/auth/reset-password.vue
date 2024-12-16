<script setup>
import { ref, reactive } from 'vue'
import { isPassword } from '@/utils'
import { resetPassword, validatePassword } from '@/api/auth'
import { useAuthStore } from '@/store/modules/auth'
import sha256 from 'sha256'

const form1Ref = ref(null)
const form2Ref = ref(null)

const steps = [
  {
    title: '密码验证',
    text: '1'
  },
  {
    title: '设置新密码',
    text: '2'
  },
  {
    title: '完成修改',
    text: '3'
  }
]

const RESULTS = {
  SUCCESS: {
    type: 'success',
    message: '修改密码成功',
    buttonType: 'primary',
    button: '重新登录'
  },
  ERROR: {
    type: 'fail',
    message: '修改密码失败',
    buttonType: 'danger',
    button: '稍后再试'
  }
}

const data = reactive({
  current: 0,
  result: {
    type: '',
    message: ''
  },
  formData: {
    form1: {
      oldPassword: ''
    },
    form2: {
      newPassword: '',
      confirmPassword: ''
    }
  }
})

const onDone = async () => {
  const { onLogout } = useAuthStore()

  if (data.result.type === RESULTS.SUCCESS.type) {
    let res = await onLogout()
    if (!res) {
      uni.showToast({ title: '正在尝试清除登录状态', icon: 'none' })
      return
    }

    uni.reLaunch({ name: 'Login' })
  } else {
    uni.navigateBack()
  }
}

const rules = {
  form1: {
    oldPassword: [
      { required: true, message: '请输入原密码' },
      {
        validator: async (rule, field, callback) => {
          let res = await validatePassword({ oldPassword: sha256(field) })
          if (!res) {
            callback(rule.message)
            return
          }

          return true
        },
        message: '当前密码不正确，请重新输入'
      }
    ]
  },
  form2: {
    newPassword: [...isPassword, { required: true, message: '请输入新密码' }],
    confirmPassword: [
      ...isPassword,
      { required: true, message: '请再次输入新密码' },
      {
        validator: () => {
          const { newPassword, confirmPassword } = data.formData.form2
          return newPassword === confirmPassword
        },
        message: '请确认新密码是否一致'
      }
    ]
  }
}

const onNext = async () => {
  let result = false
  if (!data.current) {
    result = await form1Ref.value.validator()
  } else {
    result = await form2Ref.value.validator()
  }
  if (!result) {
    return
  }

  if (!data.current) {
    data.current++
    return
  }

  let { oldPassword } = data.formData.form1
  let { newPassword, confirmPassword } = data.formData.form2

  oldPassword = sha256(oldPassword)
  newPassword = sha256(newPassword)
  confirmPassword = sha256(confirmPassword)

  try {
    let res = await resetPassword({
      oldPassword: oldPassword,
      newPassword: newPassword,
      againNewPassword: confirmPassword
    })
    if (!res) {
      throw new Error('修改密码失败')
    }
    data.result = RESULTS.SUCCESS
  } catch (error) {
    data.result = RESULTS.ERROR
  } finally {
    data.current++
  }
}
</script>

<template>
  <g-scroll-view class="reset-password-page">
    <template #header>
      <fui-nav-bar is-go-back split-line />
    </template>

    <g-steps :items="steps" :current="data.current" />

    <swiper :current="data.current" :indicator-dots="false" :interval="4000" :duration="150" class="swiper">
      <swiper-item @touchmove.stop="">
        <view class="form">
          <g-form :model="data.formData.form1" ref="form1Ref" :rules="rules.form1">
            <g-form-item label="密码" prop="oldPassword">
              <g-input v-model="data.formData.form1.oldPassword" placeholder="请输入密码" password> </g-input>
            </g-form-item>
          </g-form>

          <view class="submit">
            <fui-button @tap="onNext">下一步</fui-button>
          </view>
        </view>
      </swiper-item>
      <swiper-item @touchmove.stop="">
        <view class="form">
          <g-form :model="data.formData.form2" ref="form2Ref" :rules="rules.form2">
            <g-form-item label="新密码" prop="newPassword">
              <g-input v-model="data.formData.form2.newPassword" placeholder="请输入新密码" password> </g-input>
            </g-form-item>
            <g-form-item label="确认密码" prop="confirmPassword">
              <g-input v-model="data.formData.form2.confirmPassword" placeholder="请再次输入新密码" password> </g-input>
            </g-form-item>
          </g-form>
          <view class="submit">
            <fui-button @tap="onNext">确认</fui-button>
          </view>
        </view>
      </swiper-item>
      <swiper-item @touchmove.stop="">
        <fui-result :type="data.result.type" :descr="data.result.message" />
        <view class="submit">
          <fui-button :type="data.result.buttonType" @tap="onDone">{{ data.result.button }}</fui-button>
        </view>
      </swiper-item>
    </swiper>
  </g-scroll-view>
</template>

<style lang="scss" scoped>
.reset-password-page {
  @apply bg-white;
  .swiper {
    @apply h-72;
  }
  .form {
    @apply h-52;
  }
  .submit {
    @apply m-6;
  }
}
</style>
