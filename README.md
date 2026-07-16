# 闲鱼 Live 图静态化

目标是保留 Live 图的静态画面，同时移除客户端启动动态部分所需的 `lFileId` 和 URL 特征。

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

普通 HEIC 图片没有 `lFileId`。新版脚本会进行两项处理：

1. 删除所有 `extraInfo.lFileId`。
2. 将 URL 中的 `~livephoto~_` 改为 `_`。

已验证改写后的地址仍由阿里图片 CDN 返回同一张静态图片，HTTP 状态为 `200`。

主模块还包含一条图片 CDN 兜底重定向：即使闲鱼 App 的原生详情接口无法执行响应脚本，只要 `img.alicdn.com` 请求能够被 Shadowrocket 处理，带 `~livephoto~_` 的地址也会被重定向到静态版本。

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

`xianyu-video-cdn-test.sgmodule` 是域名级诊断模块，不需要 HTTPS 解密。它会临时屏蔽闲鱼可能使用的视频 CDN，同时也会影响普通商品视频。若启用后 Live 图不再打断后台播放，说明应继续从这些视频域名中逐个缩小范围。

`xianyu-image-cdn-test.sgmodule` 会临时屏蔽闲鱼常用图片 CDN，用于确认 Shadowrocket 的域名规则是否真的作用于闲鱼。启用并清除闲鱼缓存后，新打开商品的图片应无法加载；测试后请关闭该模块。

`xianyu-httpdns-test.sgmodule` 会临时阻断 HAR 中观察到的阿里 HTTPDNS 域名和调度 IP 段，尝试迫使闲鱼回退到系统 DNS。它可能影响淘宝、闲鱼等阿里系 App，只能作为短时间诊断模块使用。
