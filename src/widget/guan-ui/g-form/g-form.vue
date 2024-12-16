<template>
  <view
    class="fui-form__wrap"
    :style="{
      paddingTop: padding[0] || 0,
      paddingRight: padding[1] || 0,
      paddingBottom: padding[2] || padding[0] || 0,
      paddingLeft: padding[3] || padding[1] || 0
    }"
  >
    <slot></slot>
    <view
      class="fui-form__msg-wrap"
      :style="{
        bottom: bottom + 'px',
        left: left + 'rpx',
        right: right + 'rpx',
        background: background,
        borderRadius: ridus + 'rpx'
      }"
      v-if="show"
      :class="{ 'fui-form__msg-bg': !background, 'fui-form__msg-show': errorMsg }"
    >
      <text class="fui-form__text" :style="{ fontSize: size + 'rpx', color: color }">{{ errorMsg }}</text>
    </view>
    <view class="fui-form__mask" v-if="disabled"></view>
  </view>
</template>

<script>
export default {
  name: 'g-form',
  props: {
    model: {
      type: Object,
      default() {
        return {}
      }
    },
    rules: {
      type: Object,
      default() {
        return {}
      }
    },
    //表单padding值（上，右，下，左），同css顺序
    padding: {
      type: Array,
      default() {
        return []
      }
    },
    //是否显示校验错误信息
    show: {
      type: Boolean,
      default: true
    },
    //是否禁用该表单内的所有组件,透明遮罩层
    disabled: {
      type: Boolean,
      default: false
    },
    //提示框bottom值 px
    bottom: {
      type: [Number, String],
      default: 0
    },
    left: {
      type: [Number, String],
      default: 24
    },
    right: {
      type: [Number, String],
      default: 24
    },
    //错误提示框背景色
    background: {
      type: String
    },
    //错误提示字体大小
    size: {
      type: [Number, String],
      default: 28
    },
    //错误提示字体颜色
    color: {
      type: String,
      default: '#fff'
    },
    //错误提示框圆角值
    ridus: {
      type: [Number, String],
      default: 16
    },
    //错误消息显示时间 ms
    duration: {
      type: Number,
      default: 2000
    }
  },
  provide() {
    return {
      gForm: this
    }
  },
  data() {
    return {
      validationFields: {},
      fields: [],
      errorMsg: '',
      timer: null
    }
  },
  methods: {
    addValidationField(field) {
      if (!field) {
        return
      }
      this.validationFields[field.prop] = field
    },

    removeValidationField(field) {
      if (!field) {
        return
      }
      this.validationFields[field.prop] && delete this.validationFields[field.prop]
    },

    clearValicationField() {
      Object.values(this.validationFields).forEach(item => item.clearValidate())
    },

    /*
		 @param model 表单数据对象
		*/
    validator(fields = []) {
      if (fields.length > 0) {
        fields = Object.values(this.validationFields).filter(item => fields.includes(item.prop))
      } else {
        fields = Object.values(this.validationFields)
      }
      return new Promise(async resolve => {
        Promise.all(
          fields.map(async item => {
            return await item.validate()
          })
        )
          .then(res => {
            resolve(!Boolean(res.includes(false)))
          })
          .catch(error => {
            resolve(false)
          })
      })
    }
  }
}
</script>

<style scoped>
.fui-form__wrap {
  /* #ifndef APP-NVUE */
  width: 100%;
  box-sizing: border-box;
  /* #endif */
  flex: 1;
  position: relative;
}

.fui-form__msg-wrap {
  padding: 24rpx;
  position: fixed;
  z-index: 900;
  text-align: center;
  /* #ifndef APP-NVUE */
  box-sizing: border-box;
  display: flex;
  word-break: break-all;
  /* #endif */
  align-items: center;
  justify-content: center;
  opacity: 0;

  /* #ifdef APP-NVUE */
  transform: translateY(-100%);
  transition-property: transform, opacity;
  /* #endif */
  /* #ifndef APP-NVUE */
  transform: translate3d(0, 100%, 0);
  visibility: hidden;
  transition-property: all;
  /* #endif */
  transition-duration: 0.2s;
  transition-delay: 0s;
  transition-timing-function: ease-in-out;
}

/* #ifndef APP-NVUE */
.fui-form__msg-bg {
  background: #f8dcdc !important;
  border: 1rpx solid var(--fui-color-danger) !important;
}

/* #endif */

.fui-form__text {
  text-align: center;
  min-height: 30rpx;
  color: var(--fui-color-danger) !important;
}

.fui-form__msg-show {
  /* #ifndef APP-NVUE */
  visibility: visible;
  transform: translate3d(0, 0, 0);
  /* #endif */
  /* #ifdef APP-NVUE */
  transform: translateY(0);
  /* #endif */
  opacity: 1;
}

.fui-form__mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0);
  z-index: 99;
}
</style>
