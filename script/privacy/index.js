module.exports = () => {
  const { LINK_PROTOCOL, GLOBAL_PROJECT_ID } = process.env

  const serviceUrl = `${LINK_PROTOCOL}?ProjectId=${GLOBAL_PROJECT_ID}&type=SERVICE_AGREMMENT`
  const privacyUrl = `${LINK_PROTOCOL}?ProjectId=${GLOBAL_PROJECT_ID}&type=PRIVACY_POLICY`

  return {
    version: '1',
    prompt: 'template',
    title: '服务协议和隐私政策',
    message: `请你务必审慎阅读、充分理解「服务协议」和「隐私政策」各条款，包括但不限于：为了更好的向你提供服务，我们需要收集你的设备标识、操作日志等信息用于分析、优化应用性能。<br/><br/>你可阅读<a href=\"${serviceUrl}\" style="color:red">《服务协议》</a>和<a href=\"${privacyUrl}\" style="color:red">《隐私政策》</a>了解详细信息。如果你同意，请点击下面按钮开始接受我们的服务。`,
    buttonAccept: '同意并接受',
    buttonRefuse: '暂不同意',
    second: {
      title: '再次确认提示',
      message: `进入应用前，你需先同意<a href=\"${serviceUrl}\">《服务协议》</a>和<a href=\"${privacyUrl}\">《隐私政策》</a>，否则将退出应用。`,
      buttonAccept: '同意并继续',
      buttonRefuse: '退出应用'
    },
    styles: {
      backgroundColor: '#ffffff',
      borderRadius: '5px',
      title: {
        color: '#333333'
      },
      buttonAccept: {
        color: '#333333'
      },
      buttonRefuse: {
        color: '#9B9AB5'
      }
    }
  }
}
