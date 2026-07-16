// Shadowrocket HTTP response script.
// Turns Xianyu Live Photos into still images by removing their motion-file ID.

(function () {
  try {
    const payload = JSON.parse($response.body);
    let removed = 0;

    function stripLivePhotoId(value) {
      if (Array.isArray(value)) {
        for (const entry of value) stripLivePhotoId(entry);
        return;
      }

      if (!value || typeof value !== "object") return;

      if (
        value.extraInfo &&
        typeof value.extraInfo === "object" &&
        Object.prototype.hasOwnProperty.call(value.extraInfo, "lFileId")
      ) {
        delete value.extraInfo.lFileId;
        removed += 1;
      }

      for (const key of Object.keys(value)) {
        stripLivePhotoId(value[key]);
      }
    }

    stripLivePhotoId(payload);

    if (removed > 0) {
      console.log(`[Xianyu Live Photo] removed ${removed} lFileId field(s)`);
      $done({ body: JSON.stringify(payload) });
    } else {
      $done({});
    }
  } catch (error) {
    console.log(`[Xianyu Live Photo] ${String(error)}`);
    $done({});
  }
})();
