/* eslint-disable no-unused-expressions */
/*
 * @Author: 刘文柱 
 * @Date: 2018-10-18 10:09:05 
 * @Last Modified by: 刘文柱
 * @Last Modified time: 2021-01-04 13:53:57
 */
import { theme } from 'quant-ui';
switch (theme.getCurrentColor()) {
    case "default":
        import('./red.less')
        break;
    case "red":
        break;
    case "green":
        import('./green.less');
        break;
    case "purple":
        import('./purple.less');
        break;
    default:
        break;
}