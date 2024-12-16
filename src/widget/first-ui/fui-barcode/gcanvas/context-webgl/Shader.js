// 本文件由FirstUI授权予江苏伟岸纵横科技股份有限公司（手机号：1   3 0294    5 98 21，身份证尾号：290   67  0）专用，请尊重知识产权，勿私下传播，违者追究法律责任。
import {getTransferedObjectUUID} from './classUtils';

const name = 'WebGLShader';

function uuid(id) {
    return getTransferedObjectUUID(name, id);// 新特性待增加
}// 2021-5-6变更

export default class WebGLShader {
    className = name;

    constructor(id, type) {
        this.id = id;
        this.type = type;// todo: 待修改
    }// todo: 待修改

    static uuid = uuid;
// 功能需要优化
    uuid() {
        return uuid(this.id);
    }
}