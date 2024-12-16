<script setup>
import { ref, reactive } from 'vue'
import { isMobile, isPassword } from '@/utils'
import { sendVerificationCode, getBackPassword } from '@/api/auth'
import sha256 from 'sha256'

const form1Ref = ref(null)
const form2Ref = ref(null)

const verificationCodeRef = ref(null)

const steps = [
  {
    title: '账号验证',
    text: '1'
  },
  {
    title: '重置密码',
    text: '2'
  },
  {
    title: '完成设置',
    text: '3'
  }
]

const RESULTS = {
  SUCCESS: {
    type: 'success',
    message: '重置密码成功',
    buttonType: 'primary',
    button: '立即登录'
  },
  ERROR: {
    type: 'fail',
    message: '重置密码失败',
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
  verificationCodeText: '',
  formData: {
    form1: {
      mobile: '',
      verificationCode: ''
    },
    form2: {
      password: '',
      confirmPassword: ''
    }
  }
})

const onDone = () => uni.navigateBack()

const rules = {
  form1: {
    mobile: [{ required: true, message: '请输入手机号码' }, isMobile],
    verificationCode: [
      { required: true, message: '请输入验证码' },
      { min: 4, max: 4, message: '请输入正确的验证码' }
    ]
  },
  form2: {
    password: [...isPassword, { required: true, message: '请输入密码' }],
    confirmPassword: [
      ...isPassword,
      { required: true, message: '请输入密码' },
      {
        validator: () => {
          const { password, confirmPassword } = data.formData.form2
          return password === confirmPassword
        },
        message: '请确认密码是否一致'
      }
    ]
  }
}

const getVerificationCode = async () => {
  let result = await form1Ref.value.validator(['mobile'])
  if (!result || !verificationCodeRef.value.active) {
    return
  }

  try {
    let res = await sendVerificationCode({ mobile: data.formData.form1.mobile, typeEnum: 'PROJECT_MODIFY_PWD' })
    if (!res) {
      throw new Error('验证码获取失败')
    }
    verificationCodeRef.value.start()
  } catch (error) {
    console.log(error.message)
    verificationCodeRef.value.reset()
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

  let { mobile, verificationCode } = data.formData.form1
  let { password, confirmPassword } = data.formData.form2

  password = sha256(password)
  confirmPassword = sha256(confirmPassword)

  try {
    let res = await getBackPassword({
      mobile,
      newPassword: password,
      againNewPassword: confirmPassword,
      verifyCode: verificationCode
    })
    if (!res) {
      throw new Error('重置密码失败')
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
  <g-scroll-view class="forget-password-page">
    <template #header>
      <fui-nav-bar is-go-back split-line />
    </template>

    <g-steps :items="steps" :current="data.current" />

    <swiper :current="data.current" :indicator-dots="false" :interval="4000" :duration="150" class="swiper">
      <swiper-item @touchmove.stop="">
        <view class="form">
          <g-form :model="data.formData.form1" ref="form1Ref" :rules="rules.form1">
            <g-form-item label="手机号码" prop="mobile">
              <g-input
                v-model="data.formData.form1.mobile"
                placeholder="请输入手机号码"
                :maxlength="11"
                :minlength="11"
              >
              </g-input>
            </g-form-item>
            <g-form-item label="验证码" prop="verificationCode" :real-time-validate="false">
              <g-input
                v-model="data.formData.form1.verificationCode"
                placeholder="请输入验证码"
                :maxlength="4"
                :minlength="4"
              >
                <fui-tag type="primary" theme="plain" :scaleRatio="0.9" @click="getVerificationCode">
                  {{ data.verificationCodeText }}
                </fui-tag>
              </g-input>
            </g-form-item>
          </g-form>

          <view class="submit">
            <fui-button @tap="onNext">下一步</fui-button>
          </view>
          <g-verification-code
            keep-running
            unique-key="forget-password-page"
            ref="verificationCodeRef"
            @change="value => (data.verificationCodeText = value)"
          />
        </view>
      </swiper-item>
      <swiper-item @touchmove.stop="">
        <view class="form">
          <g-form :model="data.formData.form2" ref="form2Ref" :rules="rules.form2">
            <g-form-item label="密码" prop="password">
              <g-input v-model="data.formData.form2.password" placeholder="请输入密码" password> </g-input>
            </g-form-item>
            <g-form-item label="确认密码" prop="confirmPassword">
              <g-input v-model="data.formData.form2.confirmPassword" placeholder="请再次输入密码" password> </g-input>
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
.forget-password-page {
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
