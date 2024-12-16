<script setup>
import { reactive, ref, computed, onMounted, inject } from 'vue'
import { isMobile, isEnterprise } from '@/utils'
import { useProjectStore } from '@/store/modules/project'
import { routeTo } from '@/router'
import { sendVerificationCode, register } from '@/api/auth'
import { isEnterpriseExist } from '@/api/enterprise'

const { Document } = inject('Constant')

const isRegisterEnable = computed(() => {
  return useProjectStore().isRegisterEnable
})

const enterpriseType = computed(() => {
  return Global.EnterpriseType
})
const formRef = ref(null)
const verificationCodeRef = ref(null)

const RESULTS = {
  SUCCESS: {
    type: 'success',
    message: '注册成功',
    buttonType: 'primary',
    button: '立即登录'
  },
  ERROR: {
    type: 'fail',
    message: '注册失败',
    buttonType: 'danger',
    button: '稍后再试'
  }
}

const unifiedCreditCodeValidator = async (rule, field, callback) => {
  let res = await isEnterpriseExist({ unifiedCreditCode: field })
  if (res) {
    callback(rule.message)
    return false
  }
  return true
}

const enterpriseValidator = async (rule, field, callback) => {
  let res = await isEnterpriseExist({ companyName: field })
  if (res) {
    callback(rule.message)
    return false
  }
  return true
}

const rules = {
  Enterprise: {
    entName: [
      { required: true, message: '请输入企业名称' },
      { validator: enterpriseValidator, message: '该企业名称已被注册' }
    ],
    unifiedCreditCode: [
      { required: true, message: '请输入统一社会信用代码' },
      { validator: unifiedCreditCodeValidator, message: '该信用代码已被注册' }
    ],
    entContact: [{ required: true, message: '请输入企业填报人姓名' }],
    entContactMobile: [{ required: true, message: '请输入企业填报人手机号码' }, isMobile],
    verifyCode: [
      { required: true, message: '请输入验证码' },
      { min: 4, max: 4, message: '请输入正确的验证码' }
    ]
  },
  Mechanism: {
    agencyName: [
      { required: true, message: '请输入机构名称' },
      { validator: enterpriseValidator, message: '企业已存在' }
    ],
    unifiedCreditCode: [
      { required: true, message: '请输入统一社会信用代码' },
      { validator: unifiedCreditCodeValidator, message: '统一社会信用代码已存在' }
    ],
    agyMainPerson: [{ required: true, message: '请输入机构填报人姓名' }],
    agyMainPersonMobile: [{ required: true, message: '请输入机构填报人手机号码' }, isMobile],
    verifyCode: [
      { required: true, message: '请输入验证码' },
      { min: 4, max: 4, message: '请输入正确的验证码' }
    ]
  }
}

const data = reactive({
  current: 0,
  result: {
    type: '',
    message: ''
  },
  protocolChecked: false,
  verificationCodeText: '',
  formData: {
    Enterprise: {
      entName: '',
      unifiedCreditCode: '',
      entContact: '',
      entContactMobile: '',
      verifyCode: ''
    },
    Mechanism: {
      agencyName: '',
      unifiedCreditCode: '',
      agyMainPerson: '',
      agyMainPersonMobile: '',
      verifyCode: ''
    }
  }
})

const onDone = () => uni.navigateBack()

const onClickProtocol = ({ target: { dataset } }) => {
  if (dataset.code) {
    routeTo('Protocol', { code: dataset.code })
    return
  }
  data.protocolChecked = !data.protocolChecked
}

const getVerificationCode = async () => {
  let mobileField = !isEnterprise ? 'agyMainPersonMobile' : 'entContactMobile'
  let result = await formRef.value.validator([mobileField])

  console.log(result)
  if (!result || !verificationCodeRef.value.active) {
    return
  }

  try {
    let res = await sendVerificationCode({
      mobile: data.formData[enterpriseType.value][mobileField],
      typeEnum: 'PROJECT_REGISTER'
    })
    console.log(res)
    if (!res) {
      throw new Error('验证码获取失败')
    }
    verificationCodeRef.value.start()
  } catch (error) {
    verificationCodeRef.value.reset()
  }
}

const onSubmit = async () => {
  let result = await formRef.value.validator()
  if (!result) {
    return
  }
  try {
    let res = await register(!isEnterprise ? { ...data.formData.Mechanism } : { ...data.formData.Enterprise })
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

onMounted(() => {
  if (!isRegisterEnable) {
    onDone()
  }
})
</script>

<template>
  <g-scroll-view class="register-page">
    <template #header>
      <fui-nav-bar is-go-back split-line />
    </template>
    <swiper :current="data.current" :indicator-dots="false" :interval="4000" :duration="150" class="swiper">
      <swiper-item @touchmove.stop="">
        <view class="form">
          <g-form :model="data.formData[enterpriseType]" ref="formRef" :rules="rules[enterpriseType]">
            <template v-if="isEnterprise">
              <g-form-item label="企业名称" prop="entName">
                <g-input v-model="data.formData.Enterprise.entName" placeholder="请输入企业名称"> </g-input>
              </g-form-item>
              <g-form-item label="统一社会信用代码" prop="unifiedCreditCode">
                <g-input v-model="data.formData.Enterprise.unifiedCreditCode" placeholder="请输入统一社会信用代码">
                </g-input>
              </g-form-item>
              <g-form-item label="企业填报人姓名" prop="entContact">
                <g-input v-model="data.formData.Enterprise.entContact" placeholder="请输入企业填报人姓名"> </g-input>
              </g-form-item>
              <g-form-item label="企业填报人手机号码" prop="entContactMobile">
                <g-input
                  v-model="data.formData.Enterprise.entContactMobile"
                  placeholder="请输入企业填报人手机号码"
                  :maxlength="11"
                  :minlength="11"
                >
                </g-input>
              </g-form-item>
              <g-form-item label="验证码" prop="verifyCode" :real-time-validate="false">
                <g-input
                  v-model="data.formData.Enterprise.verifyCode"
                  placeholder="请输入验证码"
                  :maxlength="4"
                  :minlength="4"
                >
                  <fui-tag type="primary" theme="plain" :scaleRatio="0.9" @click="getVerificationCode">
                    {{ data.verificationCodeText }}
                  </fui-tag>
                </g-input>
              </g-form-item>
            </template>
            <template v-else>
              <g-form-item label="机构名称" prop="agencyName">
                <g-input v-model="data.formData.Mechanism.agencyName" placeholder="请输入机构名称"> </g-input>
              </g-form-item>
              <g-form-item label="统一社会信用代码" prop="unifiedCreditCode">
                <g-input v-model="data.formData.Mechanism.unifiedCreditCode" placeholder="请输入统一社会信用代码">
                </g-input>
              </g-form-item>
              <g-form-item label="企业填报人姓名" prop="agyMainPerson">
                <g-input v-model="data.formData.Mechanism.agyMainPerson" placeholder="请输入企业填报人姓名"> </g-input>
              </g-form-item>
              <g-form-item label="企业填报人手机号码" prop="agyMainPersonMobile">
                <g-input
                  v-model="data.formData.Mechanism.agyMainPersonMobile"
                  :placeholder="请输入企业填报人手机号码"
                  :maxlength="11"
                  :minlength="11"
                >
                </g-input>
              </g-form-item>
              <g-form-item label="验证码" prop="verifyCode" :real-time-validate="false">
                <g-input
                  v-model="data.formData.Mechanism.verifyCode"
                  placeholder="请输入验证码"
                  :maxlength="4"
                  :minlength="4"
                >
                  <fui-tag type="primary" theme="plain" :scaleRatio="0.9" @click="getVerificationCode">
                    {{ data.verificationCodeText }}
                  </fui-tag>
                </g-input>
              </g-form-item>
            </template>
          </g-form>

          <view class="protocol" @tap.catch="onClickProtocol">
            <fui-icon
              class="icon"
              :class="[{ active: data.protocolChecked }]"
              :name="data.protocolChecked ? 'checkbox-fill' : 'checkround'"
            />
            <text
              class="link"
              :class="[{ less: Object.keys(Document).length == 2 }, { most: Object.keys(Document).length > 2 }]"
            >
              <text v-for="(label, code) in Document" :key="code" :data-code="code">《{{ label }}》</text>
            </text>
          </view>
          <view class="submit">
            <fui-button :disabled="!data.protocolChecked" @tap="onSubmit">注册</fui-button>
          </view>
          <g-verification-code
            keep-running
            unique-key="register-page"
            ref="verificationCodeRef"
            @change="value => (data.verificationCodeText = value)"
          />
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
.register-page {
  @apply bg-white;
  .swiper {
    @apply h-[40rem];
  }
  .form {
    @apply h-52;
    .protocol {
      @apply m-6 text-sm text-color-desc;
      .icon {
        @apply text-base text-color-extra #{!important};
        &.active {
          @apply text-primary #{!important};
        }
      }
      .link {
        @apply align-text-bottom before:content-['本人已阅读并同意'];
        text {
          @apply text-primary;
          @apply last:before:content-['及'] last:after:content-['。'] after:text-color-desc before:text-color-desc;
        }
        &.less {
          text {
            @apply [&:not(:first-child):not(:last-child)]:after:content-['、'] #{!important};
          }
        }
        &.most {
          text {
            @apply [&:nth-child(-n+2)]:after:content-['、'];
          }
        }
      }
    }
  }

  .submit {
    @apply m-6;
  }
}
</style>
