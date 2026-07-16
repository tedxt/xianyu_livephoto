# 闲鱼 Live 图静态化

目标是保留 Live 图的静态画面，只移除客户端启动动态部分所需的 `lFileId`。

已确认闲鱼公开详情接口 `mtop.taobao.idle.awesome.detail/1.0` 会返回类似数据：

```json
{
  "url": "http://img.alicdn.com/...~livephoto~_...heic",
  "extraInfo": {
    "raw": "true",
    "lFileId": "1446608692560922494"
  }
}
```

普通 HEIC 图片没有 `lFileId`，所以脚本只删除该字段，不会删除图片 URL。

## 安装

1. 在 Shadowrocket 中导入 `xianyu-livephoto.sgmodule` 并启用。
2. 安装并完全信任 Shadowrocket CA 证书，开启模块所列域名的 MitM。
3. 完全退出闲鱼后重新打开含 Live 图的商品进行测试。

模块地址：

```text
https://raw.githubusercontent.com/tedxt/xianyu_livephoto/main/xianyu-livephoto.sgmodule
```

如果启用后完全没有脚本日志，说明闲鱼 App 的原生详情请求未被 Shadowrocket 解密；可先在 Safari 打开商品 H5 页面验证脚本匹配情况。

`xianyu-livephoto-block.sgmodule` 是不需要 JavaScript 的兜底测试版，会直接拒绝文件名中含 `~livephoto~_` 的资源。它也会让对应的静态图片消失，因此不建议长期使用。
