#! /usr/local/bin/node
const path = require('path')
const dotenv = require('dotenv')
const buildPrivacy = require('./privacy/build')
const buildMainfest = require('./manifest/build')
const { spawn } = require('child_process')

const exec = commands => {
  spawn(commands, { stdio: 'inherit', shell: true })
}

const cross = ({ platform, client }) => {
  return `cross-env BUILD_PLATFORM=${platform ? platform : 'h5'} TYPE=${client}`
}

const Q = [
  {
    type: 'list',
    name: 'client',
    message: '请选择客户端类型',
    choices: [
      { name: '企业端', value: 'Enterprise' },
      { name: '机构端', value: 'Mechanism' }
    ]
  },
  {
    type: 'list',
    name: 'platform',
    message: '请选择构建成果物类型',
    choices: [
      { name: 'H5', value: null },
      { name: 'APP', value: 'app' }
    ]
  }
]

const inquirer = require('inquirer')
const { program } = require('commander')

program.description('管管安全移动端编译构建 Cli').version('0.0.1', '-v, --version', '查看当前版本')

const buildDependencies = async ({ client }) => {
  try {
    await buildMainfest(client)
    console.log(`前置依赖: manifest.json 已成功生成\n`)
  } catch (error) {
    console.log(`编译失败: manifest.json 生成失败，请检查配置\n`)
    return
  }

  try {
    await buildPrivacy()
    console.log(`前置依赖: androidPrivacy.json 已成功生成\n`)
  } catch (error) {
    console.log(`编译失败: androidPrivacy.json 生成失败，请检查配置\n`)
    return
  }
}
program
  .command('dev')
  .description('调试作业')
  .action(() => {
    console.log(`进入调试作业\n`)
    inquirer.prompt(Q[0]).then(async ({ client }) => {
      await buildDependencies({ client })
      const command = 'npx uni'
      exec(`${cross({ client })} ${command}`)
    })
  })

program
  .command('build')
  .description('构建作业')
  .option('-c, --client <client>', '指定客户端类型')
  .option('-p, --platform <platform>', '指定平台类型')
  .action(async ({ client, platform }) => {
    console.log(`进入构建作业\n`)
    let command = `npx uni build`

    dotenv.config({ path: path.join(__dirname, `../.env`) })

    if (client) {
      await buildDependencies({ client })
      if (platform) command += ` -p ${platform}`
      exec(`${cross({ platform, client })} ${command}`)
    } else {
      inquirer.prompt(Q).then(async ({ platform, client }) => {
        await buildDependencies({ client })
        if (platform) command += ` -p ${platform}`
        exec(`${cross({ platform, client })} ${command}`)
      })
    }
  })

program.parse()
