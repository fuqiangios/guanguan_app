import permission from './modules/permission'

export function registerDirectives(app) {
  app.directive('permission', permission)
}
