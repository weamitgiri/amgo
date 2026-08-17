import { r as resolveMediaUrl } from "./media-DMImknnw.js";
const chef1Img = "/assets/chef-1%201-8epbgZKM.png";
const showHostImg = "/assets/show-hos%201-BuJRCJlM.png";
const chef2Img = "/assets/chef-2%201-qObaESP3.png";
const chef3Img = "/assets/chef-3%201-BHaH1mkQ.png";
const chef4Img = "/assets/chef-4%201-Becqwbd6.png";
const DEFAULT_CHEF_IMAGES = [chef1Img, chef2Img, chef3Img, chef4Img];
const DEFAULT_SHOW_HOST_IMAGE = showHostImg;
function portraitForRole(roleLabel, template) {
  if (roleLabel === "Show Host") {
    return resolveMediaUrl(template?.show_host_image) ?? DEFAULT_SHOW_HOST_IMAGE;
  }
  const match = /Chef (\d+)/.exec(roleLabel);
  const idx = match ? (Number(match[1]) - 1) % DEFAULT_CHEF_IMAGES.length : 0;
  const templateFields = [
    template?.chef1_image,
    template?.chef2_image,
    template?.chef3_image,
    template?.chef4_image
  ];
  return resolveMediaUrl(templateFields[idx]) ?? DEFAULT_CHEF_IMAGES[idx] ?? chef1Img;
}
export {
  chef1Img as c,
  portraitForRole as p,
  showHostImg as s
};
