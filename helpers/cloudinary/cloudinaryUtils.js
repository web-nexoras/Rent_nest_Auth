const { cloudinary } = require("../../configs/cloudinary");


// // -----------upload cloudinary
const uploadCloudinary = async ({mimetype, imgBuffer}) => {
  const dataUrl = `data:${mimetype};base64,${imgBuffer.toString("base64")}`;

  const res = await cloudinary.uploader.upload(dataUrl);

  return res.secure_url;
};

// -----------destroy from cloudinary
const destroyFromCloudinary = (url) => {
  const publicId = url.split("/").pop().split(".").shift();

  cloudinary.uploader.destroy(publicId, (error, result) => {
    if (error) {
      console.log("Destroy From Cloudinary:", error);
    }
  });
};

module.exports = {
  uploadCloudinary,
  destroyFromCloudinary
};

