<template>
  <view :class="['g-textarea__wrap', { error: validateError }]" @tap="fieldClick">
    <slot name="left"></slot>
    <view class="flex-1">
      <textarea
        :style="{ height: height, minHeight: minHeight }"
        :class="['g-textarea__self', { error: validateError }]"
        :placeholder-class="validateError ? 'g-textarea-placeholder-error' : 'g-textarea-placeholder'"
        :name="name"
        :value="val"
        :placeholder="_placeholder"
        :disabled="disabled"
        :cursor-spacing="cursorSpacing"
        :maxlength="maxlength"
        :focus="focused"
        :auto-height="autoHeight"
        :fixed="fixed"
        :show-confirm-bar="showConfirmBar"
        :cursor="cursor"
        :selection-start="selectionStart"
        :selection-end="selectionEnd"
        :adjust-position="adjustPosition"
        :hold-keyboard="holdKeyboard"
        :disable-default-padding="disableDefaultPadding"
        :enableNative="false"
        :show-count="false"
        @focus="onFocus"
        @blur="onBlur"
        @input="onInput"
        @confirm="onConfirm"
        @linechange="onLinechange"
        @keyboardheightchange="onKeyboardheightchange"
      ></textarea>
      <view :class="['g-textarea__counter', { error: validateError }]" v-if="isCounter && count > 0">
        <text>{{ maxlength != -1 ? `${count}/${maxlength}` : count }}</text>
      </view>
    </view>
    <slot></slot>
  </view>
</template>

<script>
export default {
  name: 'g-textarea',
  emits: ['input', 'update:modelValue', 'focus', 'blur', 'confirm', 'click', 'linechange', 'keyboardheightchange'],
  // #ifndef VUE3
  // #ifdef MP-WEIXIN
  //加group是为了避免在表单中使用时给组件加value属性
  behaviors: ['wx://form-field-group'],
  // #endif
  // #ifdef MP-BAIDU || MP-QQ
  //如果在这些平台不需要也能识别，则删除
  behaviors: ['uni://form-field'],
  // #endif
  // #endif
  // #ifdef MP-WEIXIN
  options: {
    addGlobalClass: true,
    virtualHost: true
  },
  // #endif
  props: {
    //是否为必填项
    required: {
      type: Boolean,
      default: false
    },
    //获取焦点
    focus: {
      type: Boolean,
      default: false
    },
    autoHeight: {
      type: Boolean,
      default: false
    },
    fixed: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: ''
    },
    height: {
      type: String,
      default: '120rpx'
    },
    minHeight: {
      type: String,
      default: '120rpx'
    },
    //输入框名称
    name: {
      type: String,
      default: ''
    },
    //输入框值
    value: {
      type: [Number, String],
      default: ''
    },
    // #ifdef VUE3
    //输入框值
    modelValue: {
      type: [Number, String],
      default: ''
    },
    // #endif
    disabled: {
      type: Boolean,
      default: false
    },
    maxlength: {
      type: [Number, String],
      default: 140
    },
    cursorSpacing: {
      type: Number,
      default: 0
    },
    showConfirmBar: {
      type: Boolean,
      default: false
    },
    cursor: {
      type: Number,
      default: -1
    },
    selectionStart: {
      type: Number,
      default: -1
    },
    selectionEnd: {
      type: Number,
      default: -1
    },
    adjustPosition: {
      type: Boolean,
      default: true
    },
    disableDefaultPadding: {
      type: Boolean,
      default: true
    },
    holdKeyboard: {
      type: Boolean,
      default: false
    },
    trim: {
      type: Boolean,
      default: true
    },
    isCounter: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      count: 0,
      focused: false,
      val: ''
    }
  },
  inject: {
    gFormItem: {
      default: ''
    }
  },
  computed: {
    validateError() {
      return (this.gFormItem ? this.gFormItem.validateState : '') === 'error'
    },
    _placeholder() {
      return this.disabled ? '未输入内容' : this.placeholder
    }
  },
  watch: {
    focus(val) {
      this.$nextTick(() => {
        this.focused = val
      })
    },
    // #ifdef VUE3
    modelValue(newVal) {
      this.val = this.getVal(newVal)
      this.count = this.getCount(String(this.val).length)
    },
    // #endif
    value(newVal) {
      this.val = this.getVal(newVal)
      this.count = this.getCount(String(this.val).length)
    }
  },
  created() {
    // #ifndef VUE3
    this.val = this.getVal(this.value)
    // #endif

    // #ifdef VUE3
    if (this.value && !this.modelValue) {
      this.val = this.getVal(this.value)
    } else {
      this.val = this.getVal(this.modelValue)
    }
    // #endif
    this.count = this.getCount(String(this.val).length)
  },
  mounted() {
    this.$nextTick(() => {
      this.focused = this.focus
    })
  },
  methods: {
    getVal(val) {
      return !val && val !== 0 ? '' : val
    },
    getCount(len) {
      const max = Number(this.maxlength)
      return len > max && max !== -1 ? max : len
    },
    onInput(event) {
      let value = event.detail.value
      if (this.trim) value = this.trimStr(value)
      let len = value.length
      const max = Number(this.maxlength)
      if (len > max && max !== -1) {
        len = max
        value = value.substring(0, max - 1)
      }
      this.count = len
      this.val = value
      // TODO　兼容　vue2
      this.$emit('input', value)
      // TODO　兼容　vue3
      // #ifdef VUE3
      this.$emit('update:modelValue', value)
      // #endif
    },
    onFocus(event) {
      if (this.validateError) {
        this.gFormItem.clearValidate()
      }
      this.$emit('focus', event)
    },
    onBlur(event) {
      this.$emit('blur', event)
      if (!this.gFormItem.realTimeValidate) {
        return
      }
      this.gFormItem.validate()
    },
    onConfirm(e) {
      this.$emit('confirm', e)
    },
    fieldClick() {
      this.$emit('click', {
        name: this.name
      })
    },
    onLinechange(e) {
      this.$emit('linechange', e)
    },
    onKeyboardheightchange(e) {
      this.$emit('keyboardheightchange', e)
    },
    trimStr(str) {
      return str.replace(/^\s+|\s+$/g, '')
    }
  }
}
</script>

<style lang="scss" scoped>
.g-textarea__wrap {
  @apply w-full box-border flex flex-row flex-1 items-center relative rounded-lg paint-contain;
  &.error {
    @apply bg-red-100;
  }
}

.g-textarea__self {
  @apply text-sm w-full flex-1 bg-color-input min-h-[5rem] p-3 box-border;
  &.error {
    @apply bg-red-100 text-red-600;
  }
}

.g-textarea-placeholder {
  @apply text-color-placeholder overflow-visible text-sm #{!important};
  &-error {
    @apply text-red-400 overflow-visible text-sm #{!important};
  }
}

.g-textarea__counter {
  @apply text-right bg-color-input pb-3 pr-3 text-color-placeholder text-sm;
  &.error {
    @apply bg-red-100 text-red-300;
  }
}
</style>
