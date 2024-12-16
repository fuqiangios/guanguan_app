// 本文件由FirstUI授权予江苏伟岸纵横科技股份有限公司（手机号：1  3  0 294  5  98 21，身份证尾号： 290  6 7 0）专用，请尊重知识产权，勿私下传播，违者追究法律责任。
/*
  组件属性全局配置文件。优先级：全局配置文件props < 直接设置组件props
  目前支持配置的组件：fui-button、fui-icon、fui-text、fui-input、fui-form-item
*/

const fuiConfig = {
	//组件名称，小驼峰命名
	//如fui-button写成fuiButton
	fuiButton: {
		//组件属性值
		height: '96rpx',
		size: 32,
		radius: '16rpx'
	},
	fuiIcon: {
		size: 64,
		unit: 'rpx'
	},
	fuiText: {
		size: 32,
		unit: 'rpx'
	},
	fuiInput: {
		labelSize: 32,
		size: 32
	},
	fuiFormItem: {
		labelSize: 32,
		labelWidth: 140,
		labelRight: 16
	}
}

export default fuiConfig