import dish1 from '../../../assets/cookandcreate/dish-1 1.png';
import dish2 from '../../../assets/cookandcreate/dish-2 1.png';
import dish3 from '../../../assets/cookandcreate/dish-3 1.png';
import dish4 from '../../../assets/cookandcreate/dish-4 1.png';
import dish5 from '../../../assets/cookandcreate/dish-5 1.png';
import dish6 from '../../../assets/cookandcreate/dish-6 1.png';
import dish7 from '../../../assets/cookandcreate/dish-7 1.png';
import dish8 from '../../../assets/cookandcreate/dish-8 1.png';

const DISH_IMAGES = [dish1, dish2, dish3, dish4, dish5, dish6, dish7, dish8];

/**
 * A stable plate image for a group, so the same group always shows the same
 * dish photo (there's no per-dish image in the data — this is bundled art keyed
 * deterministically by group id).
 */
export function dishImageFor(groupId: number): string {
  const n = DISH_IMAGES.length;
  return DISH_IMAGES[(((groupId % n) + n) % n)];
}
