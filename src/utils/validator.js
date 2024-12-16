export const isMobile = {
  pattern: /^1[3456789]\d{9}$/,
  message: '请输入正确的手机号码'
}

export const isPassword = [
  {
    pattern: /^.{6,20}$/,
    message: '密码长度应为6-20位'
  },
  {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-!@#$%^&*()_+|~=`{}\[\]:";'<>?,.\/]).+$/,
    message: '密码应包含大小写字母、数字和特殊字符'
  }
]

export const isUrl = [
  {
    pattern: /^(http|https):\/\/(\S+)$/,
    message: '请输入正确的 URL'
  }
]
