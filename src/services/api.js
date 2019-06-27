// let basUrl = "https://testnet.bitmex.com/api/v1";//bitmex接口
let basUrl = "/api/v1";//bitmex接口
export default {
    basUrl: basUrl,
    //委托接口
    trade: {
        //近期交易界面接口
        getTrade: basUrl + "/trade",
        //下单/查询接口
        orderCommit: basUrl + "/order",
        //查询订单接口
        getOrder: basUrl + "/orderx/sys",
        //撤销所有活动委托
        cancelOrderAll: basUrl + "/order/all",
        //获取已成交
        execution: basUrl + "/execution",
        //获取委托历史
        tradeHistory: basUrl + "/execution/tradeHistory",

    },
    //合约接口
    instrument: {
        getInstrument: basUrl + "/instrument",
    },
    //资金接口
    account: {
        getAccount: basUrl + "/accountx",
    },
    //深度图接口
    depthchart: {
        getDepth: basUrl + "/orderBook/L2",
    },
    //持仓接口
    position: {
        getPosition: basUrl + "/positionx",//获取持仓
        leverage: basUrl + "/position/leverage",//修改杠杆
        transferMargin: basUrl + "/position/transferMargin",//增加或减少保证金
        riskLimit: basUrl + "/position/riskLimit",//设置风险限额
    },
    //用户接口
    user: {
        register: basUrl + "/user/register",//注册接口
        login: basUrl + "/user/login",//登录接口
        loginOut: basUrl + "/user/logout",//登出接口
        updatePassword: basUrl + "/user/updatePasswordNew",//修改密码接口
        update: basUrl + "/user/update",//更新安全设置数据
        getPublicKey:basUrl + "/user/getPublicKey",//获取公用密钥
        getUserSysApiKey:basUrl + "/user/getUserSysApiKey",//获取系统api密钥
        findUserInfo:basUrl + "/user",//查询用户信息
        findInvitationTop:basUrl + "/user/findInvitationTop",//邀请榜单
        findUserInvitation:basUrl + "/user/findUserInvitation",//返佣列表查询
        apiKey:basUrl + "/apiKey",//api密钥管理
        apiKeyDisable:basUrl + "/apiKey/disable",//密钥停用
        apiKeyEnable:basUrl + "/apiKey/enable",//密钥启用
        sendEmail:basUrl + "/user/sendEmail",//发送邮箱验证码
        sendSms:basUrl + "/user/sendSms",//发送短信验证码
        walletHistory:basUrl + "/user/walletHistory", //钱包交易历史
        updateTelephone:basUrl + "/user/updateTelephone", //取消手机绑定 及修改手机号
        updateEmail:basUrl + "/user/updateEmail", //修改邮箱
        cancelGoogleCheck:basUrl + "/user/cancelGoogleCheck", //取消google绑定
        requestWithdrawal:basUrl + "/user/requestWithdrawal", //提现接口
        findCurrencyInfo:basUrl + "/user/findCurrencyInfo", //币种查询
        findLatelyWithdraw:basUrl + "/user/findLatelyWithdraw", //充提查询
        findDepositAddress:basUrl + "/user/findDepositAddress", //充提查询
        findTransactionHistory:basUrl + "/user/findTransactionHistory", //查询划转记录
        cancelWithdrawal:basUrl + "/user/cancelWithdrawal", //充提取消
        searchStatement:basUrl + "/search/statement", //查询资金流水
        findUserOperationLog:basUrl + "/user/findUserOperationLog", //查询日志
    },
    //公共接口
    public: {
        announcement:basUrl + "/announcement",//获取公告
    }
}
