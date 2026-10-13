const { cloudinary } = require("../../configs/cloudinary");


// // -----------upload cloudinary
const uploadCloudinary = async ({mimetype, imgBuffer}) => {
  const dataUrl = `data:${mimetype};base64,${imgBuffer.toString("base64")}`;

  const res = await cloudinary.uploader.upload(dataUrl);

  return res.secure_url;
};

// -----------destroy from cloudinary
const destroyFromCloudinary = async (url) => {
  const publicId = url.split("/").pop().split(".").shift();
  const result = await cloudinary.uploader.destroy(publicId);
  if (result?.result === "error") {
    throw new Error("Cloudinary image deletion failed");
  }
  return result;
};

module.exports = {
  uploadCloudinary,
  destroyFromCloudinary
};

