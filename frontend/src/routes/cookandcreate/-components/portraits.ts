import { resolveMediaUrl } from '@/utils/media';
import type { CCTemplate } from '@/api/types/cookandcreate';
import chef1Img from '../../../assets/cookandcreate/chef-1 1.png';
import chef2Img from '../../../assets/cookandcreate/chef-2 1.png';
import chef3Img from '../../../assets/cookandcreate/chef-3 1.png';
import chef4Img from '../../../assets/cookandcreate/chef-4 1.png';
import showHostImg from '../../../assets/cookandcreate/show-hos 1.png';

const DEFAULT_CHEF_IMAGES = [chef1Img, chef2Img, chef3Img, chef4Img];
const DEFAULT_SHOW_HOST_IMAGE = showHostImg;

/**
 * "Chef 1" / "Chef 2" ... -> the matching portrait; "Show Host" -> its own.
 * Prefers whatever a template's admin has uploaded (background_image's
 * sibling fields — chef1_image..chef4_image, show_host_image) and falls back
 * to the bundled default art per role when a template hasn't set its own —
 * so every existing template keeps working exactly as before, and only
 * templates that opt in look visually distinct.
 */
export function portraitForRole(roleLabel: string, template?: Pick<CCTemplate, 'chef1_image' | 'chef2_image' | 'chef3_image' | 'chef4_image' | 'show_host_image'> | null): string {
  if (roleLabel === 'Show Host') {
    return resolveMediaUrl(template?.show_host_image) ?? DEFAULT_SHOW_HOST_IMAGE;
  }
  const match = /Chef (\d+)/.exec(roleLabel);
  const idx = match ? (Number(match[1]) - 1) % DEFAULT_CHEF_IMAGES.length : 0;
  const templateFields: (string | null | undefined)[] = [
    template?.chef1_image,
    template?.chef2_image,
    template?.chef3_image,
    template?.chef4_image,
  ];
  return resolveMediaUrl(templateFields[idx]) ?? DEFAULT_CHEF_IMAGES[idx] ?? chef1Img;
}
