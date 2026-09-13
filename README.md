# 闲鱼 LivePhoto 屏蔽

仓库：<https://github.com/tedxt/xianyu_livephoto>

## 最新更新

模块规则和响应脚本已同步：优先把 LivePhoto 封面改写为普通静态图，拒绝 LivePhoto 视频 CDN 请求，再清理详情数据中的
`videoId` / `photoVideoUrl`，尽量在播放器初始化前阻止动态图链路，避免影响后台音频和小窗播放。

闲鱼商详会把封面图 URL 中含 `~livephoto~` 的资源改写成：

```text
https://livephoto.cloudvideocdn.taobao.com/<原路径去后缀>~livephoto~.mp4
```

然后交给播放器自动播放。模块会先把 `img.alicdn.com` / `gw.alicdn.com` 上的 LivePhoto 封面改写为普通静态图，再拦截视频请求作为兜底。

公开详情接口 `mtop.taobao.idle.awesome.detail/1.0` 里，Live 图还可能带 `extraInfo.lFileId` 和 `~livephoto~_` 文件名。脚本会删掉动态文件 ID，并把该文件名改回静态图。

## 安装

Shadowrocket 直接导入主模块：

```text
https://raw.githubusercontent.com/tedxt/xianyu_livephoto/main/xianyu-livephoto.sgmodule
```

只拦视频 CDN、不解密淘宝接口的精简版：

```text
https://raw.githubusercontent.com/tedxt/xianyu_livephoto/main/xianyu-livephoto-cdn.sgmodule
```

脚本地址：

```text
https://raw.githubusercontent.com/tedxt/xianyu_livephoto/main/xianyu_livephoto.js
```

1. Shadowrocket → 配置 → 模块 → 右上角「+」→ 粘贴上面的 raw 地址并启用。
2. 建议开启增强模式，避免闲鱼 HttpDNS 直连 IP 漏拦。
3. 主模块若要让详情脚本生效，需安装并信任 Shadowrocket CA，并开启模块所列域名的 MitM。闲鱼 mtop 常有证书锁定，解不了也不影响 CDN 拦截。
4. 完全退出闲鱼后再进商详：封面还在，画面不再循环播放。

主模块地址（可直接复制到 Shadowrocket 导入）：

```text
https://raw.githubusercontent.com/tedxt/xianyu_livephoto/main/xianyu-livephoto.sgmodule
```

也可把下面两行贴进当前配置的 `[Rule]` 靠前位置：

```text
DOMAIN,livephoto.cloudvideocdn.taobao.com,REJECT
DOMAIN-SUFFIX,livephoto.cloudvideocdn.taobao.com,REJECT
```

## 脚本会做什么

1. 删除所有 `extraInfo.lFileId`。
2. 将 URL 中的 `~livephoto~_` 改为 `_`（已验证静态图仍返回 200）。
3. 对 `type=0` 且 URL 含 `~livephoto~` 的媒体，把 `videoId` 置为 `"0"`，清空 `photoVideoUrl`，避免再走 `mtop.idle.cloud.video.query` 点播。

## 其他模块

- `xianyu-livephoto-block.sgmodule`：直接拒绝文件名含 `~livephoto~_` 的图片，静态封面也会消失，仅用于验证。
- `xianyu-video-cdn-test.sgmodule`：临时屏蔽更多视频 CDN，会误伤普通商品视频。
- `xianyu-image-cdn-test.sgmodule`：临时屏蔽图片 CDN，用于确认规则是否打到闲鱼。
- `xianyu-httpdns-test.sgmodule`：临时阻断阿里 HTTPDNS，可能影响淘宝系 App。
