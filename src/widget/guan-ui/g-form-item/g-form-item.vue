<script>
import { isEmpty, isArray, isObject, has, cloneDeep } from 'lodash'
import { func } from '../utils'
import AsyncValidator from 'async-validator'
import { isProxy, toRaw } from 'vue'

AsyncValidator.warning = func

export default {
  name: 'g-form-item',
  props: {
    condition: {
      type: Array,
      default: () => []
    },
    prop: {
      type: String
    },
    label: {
      type: String
    },
    required: {
      type: Boolean,
      default: undefined
    },
    realTimeValidate: {
      type: Boolean,
      default: true
    },
    type: {}
  },
  data: () => ({
    zIndex: 10,
    visible: true,
    initialValue: '',
    validateState: '',
    validateMessage: '',
    validateDisabled: false
  }),
  provide() {
    return {
      gFormItem: this
    }
  },
  inject: ['gForm'],
  computed: {
    fieldValue() {
      const { model } = this.gForm
      if (!model || !this.prop) {
        return
      }
      return model[this.prop]
    },

    isRequired() {
      let rules = this.getRules()
      let isRequired = false

      if (rules && rules.length) {
        rules.every(rule => {
          rule.required && (isRequired = true)
          return !rule.required
        })
      }
      return isRequired
    }
  },
  watch: {
    'gForm.model': {
      handler() {
        this.handleCondition()
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    if (!isEmpty(this.condition)) {
      this.visible = false
      this.handleCondition()
    } else {
      this.initFormItem()
    }
  },
  methods: {
    initFormItem() {
      if (this.prop) {
        try {
          this.gForm.addValidationField(this)
          this.initialValue = cloneDeep(this.gForm.model[this.prop])
        } catch (error) {
          this.initialValue = ''
        }
      }
    },
    handleCondition() {
      const { model } = this.gForm
      if (isEmpty(this.condition) || isEmpty(model)) {
        return
      }

      function getValue(target) {
        if (isObject(target) && has(target, 'value')) {
          return target.value
        } else if (isArray(target)) {
          return target.map(child => (isObject(child) && has(child, 'value') ? child.value : child))
        } else {
          return target
        }
      }

      let result = this.condition.map(item => {
        let value = getValue(model[item.target])
        if (item.lt) {
          return value < item.value
        } else if (item.le) {
          return value <= item.value
        } else if (item.eq) {
          return value == item.value
        } else if (item.ne) {
          return value != item.value
        } else if (item.ge) {
          return value >= item.value
        } else if (item.gt) {
          return value > item.value
        } else if (item.in) {
          return isArray(value) ? value.includes(item.value) : false
        } else {
          return false
        }
      })

      this.visible = !result.includes(false)
      if (this.visible) {
        this.gForm.addValidationField(this)
      } else {
        this.gForm.removeValidationField(this)
      }
    },
    validate() {
      return new Promise(resolve => {
        this.validateDisabled = false

        const { fieldValue, prop } = this
        let rules = this.getRules()
        if (rules.length === 0 && this.required === undefined) {
          resolve(true)
        } else {
          this.validateState = 'validating'
          const descriptor = {}
          const model = {}

          rules = rules.map(item => {
            if(isProxy(item) ) {
              item = toRaw(item)
            }
            return item
          })
          
          descriptor[prop] = rules

          if (isArray(fieldValue)) {
            model[prop] = fieldValue || []
          } else if (isObject(fieldValue) && has(fieldValue, 'value')) {
            model[prop] = fieldValue.value
          } else if (isObject(fieldValue) && isEmpty(fieldValue)) {
            model[prop] = null
          } else {
            model[prop] = fieldValue
          }
          const validator = new AsyncValidator(descriptor)
          console.log(model, descriptor)
          validator.validate(model, { firstFields: true }, errors => {
            this.validateState = errors ? 'error' : 'success'
            this.validateMessage = errors ? errors[0].message : ''
            resolve(!errors)
          })
        }
      })
    },

    clearValidate() {
      this.validateState = ''
      this.validateMessage = ''
      this.validateDisabled = false
    },

    resetField() {
      this.validateState = ''
      this.validateMessage = ''

      let { model } = this.gForm
      let value = this.fieldValue

      let prop = model[this.prop]

      this.validateDisabled = true

      if (Array.isArray(value)) {
        prop = [].concat(this.initialValue)
      } else {
        prop = this.initialValue
      }

      // reset validateDisabled after onFieldChange triggered
      this.$nextTick(() => {
        this.validateDisabled = false
      })
    },

    getRules() {
      let formRules = this.gForm.rules

      const required = this.required !== undefined ? { required: !!this.required, message: '必填项' } : []

      return (!isEmpty(formRules[this.prop]) ? formRules[this.prop] : []).concat(required)
    }
  }
}
</script>

<template>
  <view class="g-form-item" v-if="visible">
    <view class="g-form-item__header">
      <view class="g-form-item__header-left">
        <span class="label">
          {{ label }}
        </span>
        <span v-if="label" :class="[{ required: isRequired }]" />
      </view>
      <view class="g-form-item__header-right">
        <g-animation :duration="300" :type="['slide-right']" :show="validateState === 'error'">
          <view class="text">{{ validateMessage }}</view>
        </g-animation>
      </view>
    </view>
    <view
      class="g-form-item__content"
      style="
         {
          zindex: zIndex;
        }
      "
    >
      <slot />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.g-form-item {
  @apply pt-3 pl-6 pr-6;
  &__header {
    @apply flex justify-start content-center items-center h-6 mb-2;
    &-left {
      @apply flex-1;
      .label {
        @apply text-sm;
      }
      .required {
        @apply pl-1 after:content-['*'] text-red-500 inline-block align-middle h-4;
      }
    }
    &-right {
      @apply relative flex items-center text-left text-xs;

      .text {
        @apply text-red-500;
      }
      &.error {
        .text {
          @apply text-red-500 opacity-100 translate-x-0;
        }
      }
    }
  }

  &__content {
    @apply bg-white;
  }
}
</style>
