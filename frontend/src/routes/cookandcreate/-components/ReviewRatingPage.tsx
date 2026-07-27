import { useState } from 'react';
import { Star } from 'lucide-react';
import { CookCreateLayout } from './CookCreateLayout';
import { CookCreateHeader } from './CookCreateHeader';
import dish1Img from '../../../assets/cookandcreate/dish-1 1.png';
import dish5Img from '../../../assets/cookandcreate/dish-5 1.png';
import imposterImg from '../../../assets/cookandcreate/imposter 1.png';
import chef4Img from '../../../assets/cookandcreate/chef-4 1.png';
import funAward1 from '../../../assets/cookandcreate/fun-award-1 1.png';
import funAward2 from '../../../assets/cookandcreate/fun-award-2 1.png';
import funAward3 from '../../../assets/cookandcreate/fun-award-3 1.png';
import funAward4 from '../../../assets/cookandcreate/fun-award-4 1.png';
import funAward5 from '../../../assets/cookandcreate/fun-award-5 1.png';
import funAward6 from '../../../assets/cookandcreate/fun-award-6 1.png';
import creativeImg from '../../../assets/cookandcreate/Creative!.png';
import funnyImg from '../../../assets/cookandcreate/Funny!.png';
import whatImg from '../../../assets/cookandcreate/What is this_!.png';
import yikesImg from '../../../assets/cookandcreate/Yikes!.png';

interface ReviewRatingPageProps {
  dishName: string;
}

const reactions = [
  { emoji: '😋', label: 'Delicious!', count: 8 },
  { emoji: '🤩', label: 'Creative!', count: 4 },
  { emoji: '😂', label: 'Funny!', count: 6 },
  { img: whatImg, label: 'What is this?', count: 5 },
  { img: yikesImg, label: 'Yikes!', count: 2 },
];

const gameSteps = [
  { label: 'A', text: 'Sauté the onions and garlic in butter until soft and aromatic.' },
  { label: 'B', text: 'Marinate the chicken with garlic paste, salt, and spices, then let it rest for 15 minutes before cooking.' },
  { label: 'C', text: 'Add chopped tomatoes and cook until the mixture thickens.' },
  { label: 'D', text: 'Slowly add cream while stirring continuously to maintain a smooth texture and prevent the sauce from' },
  { label: 'E', text: 'Season with salt and pepper, then garnish and serve hot.' },
];

const funAwards = [
  { title: 'Master Chef', player: 'Ptoto79', img: funAward1 },
  { title: 'Picasso of the Kitchen', player: 'Ptoto79', img: funAward2 },
  { title: 'The Sneaky Genius', player: 'Ptoto79', img: funAward3 },
  { title: 'Funniest Dish', player: 'Ptoto79', img: funAward4 },
  { title: 'Most Confusing Dish', player: 'Ptoto79', img: funAward5 },
];

const ratingBadges = [
  { img: funAward1, label: 'Would Actually Eat This' },
  { img: funAward2, label: 'Smartest Ingredient Use' },
  { img: funAward3, label: 'Too Spicy to Handle' },
  { img: funAward4, label: 'Taste Buds Destroyer' },
  { img: funAward5, label: 'Science Experiment Gone Wrong' },
];

export function ReviewRatingPage({ dishName }: ReviewRatingPageProps) {
  const [userRating, setUserRating] = useState(4);
  const [selectedBadge, setSelectedBadge] = useState(3); // "Taste Buds Destroyer" selected by default

  return (
    <CookCreateLayout breadcrumb="Cook & Create / Review">
      <div className="relative z-10 space-y-4">
        {/* Header with Exit to Lobby button */}
        <div className="w-full bg-white rounded-2xl px-6 py-3.5 flex items-center justify-between border border-[#F0E4D4] shadow-sm">
          {/* Left: Logo & Title */}
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/cookandcreate/Cook  and Create Logo.png"
              alt="Cook & Create"
              className="w-9 h-9 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="text-lg font-extrabold text-[#3D2E1F]">
              Cook &amp; Create
            </span>
          </div>

          {/* Center: Exit button + Timer */}
          <div className="flex items-center gap-3">
            <button className="px-5 py-2 rounded-full bg-[#E8881E] hover:bg-[#D47815] text-white font-bold text-sm transition-transform hover:scale-105 active:scale-95 shadow-md cursor-pointer">
              Exit to Lobby
            </button>
            <div className="flex items-center gap-3 bg-[#FFF3E0] border border-[#E8881E]/15 rounded-xl px-4 py-2">
              <span className="text-xs font-bold text-[#8B7355] uppercase tracking-wider">
                Game Time
              </span>
              <span className="text-base font-extrabold text-[#3D2E1F] font-mono">
                24:58
              </span>
            </div>
          </div>

          {/* Right: User */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FF8A65] text-white font-bold text-xs flex items-center justify-center shadow-sm">
              SK
            </div>
            <span className="text-sm font-bold text-[#3D2E1F]">
              Sneha Kapoor
            </span>
          </div>
        </div>

        {/* Main 2-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-5 items-start">
          {/* ===== LEFT COLUMN ===== */}
          <div className="space-y-4">
            {/* Top: Recipe Reveal + Ratings */}
            <div className="bg-[#FFF8EE] rounded-[24px] border border-[#F5DCBD] p-6 shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recipe Reveal */}
                <div className="text-center">
                  <h3 className="text-lg font-black text-[#3D2E1F] mb-1">
                    Recipe Reveal
                  </h3>
                  <p className="text-xs text-[#8B7355] mb-1">
                    Your group cooked up...
                  </p>
                  <p className="text-sm font-black text-[#E8881E] mb-3">
                    {dishName || 'Creamy Herb Chicken Pasta'}
                  </p>
                  <div className="rounded-2xl overflow-hidden border border-[#F5E2C8] shadow-md">
                    <img
                      src={dish1Img}
                      alt="Dish"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>

                {/* Ratings & Reaction */}
                <div className="text-center">
                  <h3 className="text-lg font-black text-[#3D2E1F] mb-1">
                    Ratings & Reaction
                  </h3>
                  <p className="text-xs text-[#8B7355] mb-3 leading-relaxed">
                    The verdict is in. Other teams have
                    <br />
                    tasted your creation.
                  </p>

                  <p className="text-xs font-bold text-[#3D2E1F] mb-1">
                    Average Rating Received Dish
                  </p>

                  {/* Stars */}
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <Star
                        key={i}
                        size={24}
                        className="text-[#E8881E] fill-[#E8881E]"
                      />
                    ))}
                    <Star
                      size={24}
                      className="text-[#E8881E]"
                      fill="url(#halfStar)"
                    />
                    <svg width="0" height="0">
                      <defs>
                        <linearGradient id="halfStar">
                          <stop offset="50%" stopColor="#E8881E" />
                          <stop offset="50%" stopColor="transparent" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <p className="text-lg font-black text-[#3D2E1F] mb-4">
                    4.5<span className="text-sm font-bold text-[#8B7355]">/5</span>
                  </p>

                  {/* Reactions */}
                  <p className="text-xs font-bold text-[#3D2E1F] mb-2">
                    Reactions
                  </p>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {reactions.map((r) => (
                      <div
                        key={r.label}
                        className="flex flex-col items-center gap-1"
                      >
                        <div className="w-10 h-10 rounded-full bg-[#FFF3E0] border border-[#F5E2C8] flex items-center justify-center">
                          {r.img ? (
                            <img
                              src={r.img}
                              alt={r.label}
                              className="w-7 h-7 object-contain"
                            />
                          ) : (
                            <span className="text-xl">{r.emoji}</span>
                          )}
                        </div>
                        <span className="text-[9px] text-[#8B7355] font-medium leading-tight text-center max-w-[50px]">
                          {r.label}
                        </span>
                        <span className="text-xs font-black text-[#E8881E]">
                          {r.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom: Imposter Reveal + Fun Awards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Imposter Reveal */}
              <div className="bg-[#FFF8EE] rounded-[24px] border border-[#F5DCBD] p-5 shadow-xs">
                <h3 className="text-base font-black text-[#E8881E] text-center mb-3">
                  The Imposter has been unmarked
                </h3>
                <div className="flex items-start gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-[#E8881E] font-semibold leading-relaxed">
                      The group has spoken.
                      <br />
                      The most suspected player is
                      <br />
                      <span className="font-black text-[#3D2E1F] text-sm">
                        Mark32
                      </span>
                    </p>
                    <span className="text-2xl">😈</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="w-20 h-24 rounded-2xl overflow-hidden border border-[#F5E2C8] shadow-xs bg-[#2D2D2D]">
                      <img
                        src={imposterImg}
                        alt="Imposter"
                        className="w-full h-full object-cover"
                        style={{ objectPosition: 'center 20%' }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#E8881E]">
                      Mark32
                    </span>
                    <span className="text-[10px] font-medium text-[#8B7355]">
                      Chef 4
                    </span>
                  </div>
                </div>
              </div>

              {/* Fun Awards */}
              <div className="bg-[#FFF8EE] rounded-[24px] border border-[#F5DCBD] p-5 shadow-xs">
                <h3 className="text-base font-black text-[#3D2E1F] text-center mb-3">
                  Fun Awards
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {funAwards.map((award) => (
                    <div
                      key={award.title}
                      className="bg-white rounded-xl border border-[#F5E6D3] px-3 py-2.5 text-center shadow-xs"
                    >
                      <p className="text-xs font-bold text-[#3D2E1F] leading-tight">
                        {award.title}
                      </p>
                      <p className="text-[10px] text-[#E8881E] font-semibold mt-0.5">
                        {award.player}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div className="space-y-4">
            {/* What Other Kitchens Cooked Up */}
            <div className="bg-[#FFF8EE] rounded-[24px] border border-[#F5DCBD] p-5 shadow-xs">
              <h3 className="text-base font-black text-[#3D2E1F] text-center mb-4">
                What Other Kitchens Cooked Up
              </h3>

              {/* Other group's dish */}
              <div className="flex items-center gap-3 mb-4 bg-white rounded-xl border border-[#F5E6D3] p-3 shadow-xs">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#F5E2C8] shrink-0">
                  <img
                    src={dish5Img}
                    alt="Other dish"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-[#8B7355] font-medium">
                    Group 6
                  </p>
                  <p className="text-sm font-black text-[#3D2E1F]">
                    Spicy Dragon Delight
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-0.5 text-[10px]">
                      <Star
                        size={10}
                        className="text-[#E8881E] fill-[#E8881E]"
                      />
                      <span className="font-bold text-[#3D2E1F]">4.5/5</span>
                    </span>
                    <span className="text-[10px] text-[#8B7355]">
                      👥 8 Voted Most Delicious
                    </span>
                  </div>
                </div>
              </div>

              {/* Game Steps */}
              <div className="mb-4">
                <h4 className="text-sm font-black text-[#E8881E] mb-2">
                  Game Step
                </h4>
                <div className="space-y-2">
                  {gameSteps.map((step) => (
                    <div key={step.label} className="flex items-start gap-2">
                      <span className="text-sm font-black text-[#3D2E1F] shrink-0 w-5">
                        {step.label}
                      </span>
                      <p className="text-xs text-[#6E5A44] leading-relaxed font-medium">
                        {step.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-t border-[#F0D5B5] my-3" />

              {/* Give Rating */}
              <div className="text-center mb-4">
                <h4 className="text-sm font-black text-[#3D2E1F] mb-2">
                  Give Rating
                </h4>
                <div className="flex items-center justify-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      onClick={() => setUserRating(i)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        size={22}
                        className={
                          i <= userRating
                            ? 'text-[#E8881E] fill-[#E8881E]'
                            : 'text-[#D4C5B3]'
                        }
                      />
                    </button>
                  ))}
                  <span className="text-sm font-black text-[#3D2E1F] ml-2">
                    {userRating}
                    <span className="text-xs font-bold text-[#8B7355]">/5</span>
                  </span>
                </div>
              </div>

              {/* Rating Badges */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {ratingBadges.map((badge, i) => (
                  <button
                    key={badge.label}
                    onClick={() => setSelectedBadge(i)}
                    className={`
                      flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all cursor-pointer min-w-[70px] max-w-[80px]
                      ${
                        selectedBadge === i
                          ? 'border-[#E8881E] bg-[#FFF3E0] shadow-md'
                          : 'border-[#F5E6D3] bg-white hover:border-[#E8881E]/50'
                      }
                    `}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                      <img
                        src={badge.img}
                        alt={badge.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[9px] font-bold text-[#3D2E1F] leading-tight text-center">
                      {badge.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CookCreateLayout>
  );
}
