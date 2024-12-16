<template>
  <view :class="['g-input__wrap', { error: validateError }]" @tap="fieldClick">
    <slot name="left"></slot>
    <template v-if="prepend.length > 0">
      <view :class="['g-input__prepend', { error: validateError }]">{{ prepend }}</view>
    </template>

    <input
      :class="['g-input__self', { error: validateError }]"
      :placeholder-class="validateError ? 'g-input__placeholder-error' : 'g-input__placeholder'"
      :type="type"
      :name="name"
      :value="val"
      :password="password"
      :placeholder="_placeholder"
      :disabled="disabled"
      :cursor-spacing="cursorSpacing"
      :maxlength="maxlength"
      :focus="focused"
      :confirm-type="confirmType"
      :confirm-hold="confirmHold"
      :cursor="cursor"
      :selection-start="selectionStart"
      :selection-end="selectionEnd"
      :adjust-position="adjustPosition"
      :hold-keyboard="holdKeyboard"
      :auto-blur="autoBlur"
      :enableNative="false"
      :always-embed="alwaysEmbed"
      @focus="onFocus"
      @blur="onBlur"
      @input="onInput"
      @confirm="onConfirm"
      @keyboardheightchange="onKeyboardheightchange"
    />
    <view
      v-if="clearable && val.length > 0 && isFocus"
      :class="['g-input__clearable', { error: validateError }]"
      @mousedown.stop="onClear"
    >
      <fui-icon custom-prefix="feather" name="icon-x-circle" class="icon" />
    </view>
    <template v-if="$slots.default">
      <view :class="['g-input__slot', { error: validateError }]">
        <slot></slot>
      </view>
    </template>
    <template v-else>
      <view :class="['g-input__append', { error: validateError }]" v-if="append.length > 0">{{ append }}</view>
    </template>
  </view>
</template>

<script>
export default {
  name: 'g-input',
  emits: ['input', 'update:modelValue', 'focus', 'blur', 'confirm', 'click', 'keyboardheightchange'],
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
    clearable: {
      type: Boolean,
      default: true
    },
    focus: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: ''
    },
    //输入框名称
    name: {
      type: String,
      default: ''
    },
    //输入框值 vue2
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
    //vue3
    modelModifiers: {
      default: () => ({})
    },
    //兼容写法，type为text时也做Number处理，NaN时返回原值
    number: {
      type: Boolean,
      default: false
    },
    //与官方input type属性一致
    type: {
      type: String,
      default: 'text'
    },
    password: {
      type: Boolean,
      default: false
    },
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
    confirmType: {
      type: String,
      default: 'done'
    },
    confirmHold: {
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
    holdKeyboard: {
      type: Boolean,
      default: false
    },
    autoBlur: {
      type: Boolean,
      default: false
    },
    alwaysEmbed: {
      type: Boolean,
      default: false
    },
    size: {
      type: [Number, String],
      default: 0
    },
    color: {
      type: String,
      default: '#333'
    },
    isFillet: {
      type: Boolean,
      default: false
    },
    trim: {
      type: Boolean,
      default: true
    },
    prepend: {
      type: String,
      default: ''
    },
    append: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isFocus: false,
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
      this.val = newVal
    },
    // #endif
    value(newVal) {
      this.val = newVal
    }
  },
  created() {
    // #ifndef VUE3
    this.val = this.value
    // #endif

    // #ifdef VUE3
    if (this.value && !this.modelValue) {
      this.val = this.value
    } else {
      this.val = this.modelValue
    }
    // #endif
  },
  mounted() {
    this.$nextTick(() => {
      // #ifdef MP-TOUTIAO
      setTimeout(() => {
        this.focused = this.focus
      }, 300)
      // #endif
      // #ifndef MP-TOUTIAO
      setTimeout(() => {
        this.focused = this.focus
      }, 120)
      // #endif
    })
  },
  methods: {
    onInput(event) {
      let value = event.detail.value
      if (this.trim) value = this.trimStr(value)
      this.val = value

      this.$nextTick(() => {
        //当输入框为空时，输入框显示不赋值为0，返回值为0
        event.detail.value !== '' && (this.val = value)
      })
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
      this.isFocus = true
      this.$emit('focus', event)
    },
    onBlur(event) {
      this.isFocus = false
      this.$emit('blur', event)
      if (!this.gFormItem.realTimeValidate) {
        return
      }
      this.gFormItem.validate()
    },
    onConfirm(e) {
      this.$emit('confirm', e)
    },
    onClear(event) {
      event.preventDefault()
      if (this.disabled) return
      uni.hideKeyboard()
      this.val = ''
      this.$emit('input', '')
      // #ifdef VUE3
      this.$emit('update:modelValue', '')
      // #endif
    },
    fieldClick() {
      this.$emit('click', {
        name: this.name
      })
    },
    onKeyboardheightchange(e) {
      this.$emit('keyboardheightchange', e.detail)
    },
    trimStr(str) {
      return str.replace(/^\s+|\s+$/g, '')
    }
  }
}
</script>

<style lang="scss" scoped>
.g-input__wrap {
  @apply w-full box-border pt-3 pb-3 h-10 flex flex-row flex-1 items-center relative rounded-lg paint-contain bg-color-input;
  &.error {
    @apply bg-red-100;
  }
}

.g-input__self {
  @apply h-full pl-3 pr-3 text-sm flex-1 bg-color-input box-border;
  &.error {
    @apply bg-red-100 text-red-600;
  }
}

.g-input__clearable {
  @apply bg-color-input h-10 text-sm box-border flex items-center;

  .icon {
    @apply p-3 text-base text-color-placeholder #{!important};
  }
  &.error {
    @apply bg-red-100 text-red-600;
  }
}
.g-input__slot {
  @apply bg-color-input  p-3 text-sm box-border flex items-center;

  &.error {
    @apply bg-red-100 text-red-600 border-red-200;
  }
}
.g-input__prepend {
  @apply bg-color-input p-3 text-sm box-border flex items-center;

  &.error {
    @apply bg-red-100 text-red-600 border-red-200;
  }
}
.g-input__append {
  @apply border-left bg-color-input  p-3 text-sm box-border flex items-center;

  &.error {
    @apply bg-red-100 text-red-600 border-red-200;
  }
}

.g-input__placeholder {
  @apply text-color-placeholder overflow-visible text-sm #{!important};
  &-error {
    @apply text-red-400 overflow-visible text-sm #{!important};
  }
}
</style>
