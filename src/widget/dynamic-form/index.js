import { isEmpty, isNumber, isObject, cloneDeep } from 'lodash'

export const inferences = {
  bool: false,
  number: 0,
  string: '',
  array: [],
  object: {},
  null: '',
  undefined: ''
}

export const t = Object.freeze({
  INPUT: 'input',
  SWITCH: 'switch',
  TEXTAREA: 'textarea',
  SLIDER: 'slider',
  RATE: 'rate',
  PICKER: 'picker',
  DATE_TIME_PICKER: 'dateTime',
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
  CALENDAR: 'calendar',
  CASCADER: 'cascader', // TODO
  INPUT_NUMBER: 'inputNumber',
  UPLOAD: 'upload',
  AUTOGRAPH: 'autograph', // TODO
  MULTI_STAGE: 'multi-stage'
})

export const initial = {
  global: {
    disabled: false,
    trim: false
  },
  [t.INPUT]: {
    type: 'text',
    password: false,
    clearable: true,
    trim: false,
    placeholder: '请输入内容'
  },
  [t.SWITCH]: {
    type: 'switch',
    scaleRatio: 1
  },
  [t.TEXTAREA]: {
    trim: false,
    height: '100rpx',
    minHeight: '100rpx',
    border: false,
    borderTop: false,
    borderBottom: false,
    autoHeight: false,
    maxlength: -1,
    count: true
  },
  [t.SLIDER]: {
    min: 0,
    max: 100,
    section: false,
    step: 1
  },
  [t.RATE]: {
    max: 5,
    half: false
  },
  [t.PICKER]: {
    placeholder: '请选择',
    linkage: true,
    layer: 1,
    optionItems: []
  },
  [t.DATE_TIME_PICKER]: {
    type: '3',
    minDate: '1980-01-01',
    maxDate: '2050-01-01'
  },
  [t.RADIO]: {
    isCheckMark: false,
    scaleRatio: 0.9,
    borderRadius: '50%'
  },
  [t.CHECKBOX]: {
    isCheckMark: false,
    scaleRatio: 0.8,
    borderRadius: '10%'
  },
  [t.CALENDAR]: {
    type: 3,
    lunar: true,
    vertical: true
  },
  [t.UPLOAD]: {
    suffix: ['jpg', 'png']
  },
  [t.MULTI_STAGE]: {}
}

export const isPopupType = e => [t.PICKER, t.DATE_TIME_PICKER, t.CALENDAR].includes(e)

export function fillUp(inference, value) {
  if (isNumber(value)) {
    return value
  }
  return !isEmpty(value) ? value : inferences[inference]
}

export function parseInference(inference, type, key, values = {}) {
  // console.log(key, values, inference)
  if (!isObject(inference)) {
    return fillUp(inference, values[key])
  }
  let result = {}

  if (isPopupType(type)) {
    result.visable = false
  }

  isEmpty(values[key]) && (values[key] = {})

  Object.entries(inference).forEach(item => {
    result[item[0]] = inferences.hasOwnProperty(item[1]) ? fillUp(item[1], values[key][item[0]]) : undefined
  })

  if (!isEmpty(values[key])) {
    result = { ...result, ...values[key] }
  }

  return result
}

export const dateTimeFormats = ({ year, month, day, hour, minute, second }) => [
  `${year}年`,
  `${year}年${month}月`,
  `${year}年${month}月${day}日`,
  `${year}年${month}月${day}日${hour}时`,
  `${year}年${month}月${day}日${hour}时${minute}分`,
  `${hour}时${minute}分`,
  `${hour}时${minute}分${second}秒`,
  `${minute}分${second}秒`
]
