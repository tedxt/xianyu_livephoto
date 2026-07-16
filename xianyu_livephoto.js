// Shadowrocket HTTP response script.
// Turns Xianyu Live Photos into still images by removing their motion-file ID
// and rewriting the special Live Photo object name to its static HEIC variant.

(function () {
  try {
    const payload = JSON.parse($response.body);
    let removedIds = 0;
    let rewrittenUrls = 0;

    function staticizeLivePhoto(value) {
      if (Array.isArray(value)) {
        for (let index = 0; index < value.length; index += 1) {
          value[index] = staticizeLivePhoto(value[index]);
        }
        return value;
      }

      if (typeof value === "string") {
        const rewritten = value
          .replace(/~livephoto~_/gi, "_")
          .replace(/%7Elivephoto%7E_/gi, "_");

        if (rewritten !== value) rewrittenUrls += 1;
        return rewritten;
      }

      if (!value || typeof value !== "object") return value;

      if (
        value.extraInfo &&
        typeof value.extraInfo === "object" &&
        Object.prototype.hasOwnProperty.call(value.extraInfo, "lFileId")
      ) {
        delete value.extraInfo.lFileId;
        removedIds += 1;
      }

      for (const key of Object.keys(value)) {
        value[key] = staticizeLivePhoto(value[key]);
      }

      return value;
    }

    staticizeLivePhoto(payload);

    if (removedIds > 0 || rewrittenUrls > 0) {
      console.log(
        `[Xianyu Live Photo] removed ${removedIds} lFileId field(s), ` +
          `rewrote ${rewrittenUrls} Live Photo URL(s)`
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
