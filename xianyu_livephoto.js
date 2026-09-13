/**
 * 闲鱼 LivePhoto 静态化
 * Repo: https://github.com/tedxt/xianyu_livephoto
 * Module: https://raw.githubusercontent.com/tedxt/xianyu_livephoto/main/xianyu-livephoto.sgmodule
 *
 * 1. 删除 extraInfo.lFileId
 * 2. 将 URL 中的 ~livephoto~_ 改成 _
 * 3. 对 type=0 且 URL 含 ~livephoto~ 的媒体，把 videoId 置为 "0"，清空 photoVideoUrl
 */

const REPO = "https://github.com/tedxt/xianyu_livephoto";
const LIVEPHOTO_RE = /~livephoto~/i;
const LIVEPHOTO_STATIC_RE = /~livephoto~_/gi;
const LIVEPHOTO_STATIC_ENC_RE = /%7Elivephoto%7E_/gi;

function containsLivePhoto(value) {
  return typeof value === "string" && LIVEPHOTO_RE.test(value);
}

function rewriteLivePhotoString(value) {
  return value
    .replace(LIVEPHOTO_STATIC_RE, "_")
    .replace(LIVEPHOTO_STATIC_ENC_RE, "_");
}

function isLivePhotoMedia(node) {
  if (!node || typeof node !== "object") return false;
  const urls = [node.url, node.photoVideoUrl, node.coverUrl, node.videoUrl, node.livePhotoUrl];
  return urls.some(containsLivePhoto);
}

function staticizeLivePhoto(value, stats) {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      value[i] = staticizeLivePhoto(value[i], stats);
    }
    return value;
  }

  if (typeof value === "string") {
    if (value.length > 2 && (value.charAt(0) === "{" || value.charAt(0) === "[")) {
      try {
        const nested = JSON.parse(value);
        staticizeLivePhoto(nested, stats);
        return JSON.stringify(nested);
      } catch (error) {}
    }
    const rewritten = rewriteLivePhotoString(value);
    if (rewritten !== value) stats.rewrittenUrls += 1;
    return rewritten;
  }

  if (!value || typeof value !== "object") return value;

  if (
    value.extraInfo &&
    typeof value.extraInfo === "object" &&
    Object.prototype.hasOwnProperty.call(value.extraInfo, "lFileId")
  ) {
    delete value.extraInfo.lFileId;
    stats.removedIds += 1;
  }

  if (isLivePhotoMedia(value)) {
    stats.livePhotoNodes += 1;
    if ("videoId" in value && value.videoId && value.videoId !== "0") {
      value.videoId = "0";
      stats.clearedVideoIds += 1;
    }
    if ("photoVideoUrl" in value && value.photoVideoUrl) {
      value.photoVideoUrl = "";
      stats.clearedPhotoVideoUrls += 1;
    }
  }

  const keys = Object.keys(value);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    value[key] = staticizeLivePhoto(value[key], stats);
  }
  return value;
}

(function () {
  try {
    const payload = JSON.parse($response.body);
    const stats = {
      removedIds: 0,
      rewrittenUrls: 0,
      livePhotoNodes: 0,
      clearedVideoIds: 0,
      clearedPhotoVideoUrls: 0,
    };

    staticizeLivePhoto(payload, stats);

    if (
      stats.removedIds > 0 ||
      stats.rewrittenUrls > 0 ||
      stats.clearedVideoIds > 0 ||
      stats.clearedPhotoVideoUrls > 0
    ) {
      console.log(
        `[Xianyu Live Photo] ${REPO} removed ${stats.removedIds} lFileId, ` +
          `found ${stats.livePhotoNodes} LivePhoto node(s), ` +
          `rewrote ${stats.rewrittenUrls} URL(s), ` +
          `cleared ${stats.clearedVideoIds} videoId / ${stats.clearedPhotoVideoUrls} photoVideoUrl`
      );
      $done({ body: JSON.stringify(payload) });
    } else {
      $done({});
    }
  } catch (error) {
    console.log(`[Xianyu Live Photo] ${String(error)}`);
    $done({});
  }
})();
