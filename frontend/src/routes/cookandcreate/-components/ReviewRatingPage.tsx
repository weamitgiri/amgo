import { useState } from 'react';
import { Star } from 'lucide-react';
import { CookCreateLayout } from './CookCreateLayout';
import { CookCreateHeader } from './CookCreateHeader';
import dish1Img from '../../../assets/cookandcreate/dish-1 1.png';
import dish5Img from '../../../assets/cookandcreate/dish-5 1.png';
import imposterImg from '../../../assets/cookandcreate/imposter 1.png';
import chef4Img from '../../../assets/cookandcreate/chef-4 1.png';

import funAward1 from '../../../assets/cookandcreate/delicious.png';
import funAward2 from '../../../assets/cookandcreate/funny.png';
import funAward3 from '../../../assets/cookandcreate/rectangle.png';
import funAward4 from '../../../assets/cookandcreate/what.png';
import funAward5 from '../../../assets/cookandcreate/yikes.png';
import funAward6 from '../../../assets/cookandcreate/fun-award-6 1.png';

import creativeImg from '../../../assets/cookandcreate/Creative!.png';
import funnyImg from '../../../assets/cookandcreate/funny.png';
import whatImg from '../../../assets/cookandcreate/what.png';
import yikesImg from '../../../assets/cookandcreate/yikes.png';
import deliciousImg from '../../../assets/cookandcreate/delicious.png';
import chefMaskImg from '../../../assets/cookandcreate/chef-mask.png';

interface ReviewRatingPageProps {
  dishName: string;
}

const reactions = [
  { img: deliciousImg, label: 'Delicious!', count: 8 },
  { img: creativeImg, label: 'Creative!', count: 4 },
  { img: funnyImg, label: 'Funny!', count: 6 },
  { img: whatImg, label: 'What is this?!', count: 5 },
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
  { img: deliciousImg, label: 'Would Actually Eat This' },
  { img: funnyImg, label: 'Smartest Ingredient Use' },
  { img: creativeImg, label: 'Too Spicy to Handle' },
  { img: whatImg, label: 'Taste Buds Destroyer' },
  { img: yikesImg, label: 'Science Experiment' },
];

export function ReviewRatingPage({ dishName }: ReviewRatingPageProps) {
  const [userRating, setUserRating] = useState(4);
  const [selectedBadge, setSelectedBadge] = useState(3); // "Taste Buds Destroyer" selected by default

  return (
    <CookCreateLayout breadcrumb="Cook & Create / Review">
      <div className="relative z-10 space-y-5">
        {/* Header with Exit to Lobby button */}
        <div className="w-full bg-white rounded-2xl px-6 py-3.5 flex items-center justify-between border border-[#F0E4D4] shadow-sm">
          {/* Left: Logo & Title */}
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/cookandcreate/Cook  and Create Logo.png"
              alt="Cook & Create"
              className="w-10 h-10 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="text-xl font-black text-[#3D2E1F]">
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
            <div className="bg-[#FFFDF9] rounded-2xl border border-[#F0DECA] p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Recipe Reveal */}
                <div className="text-center">
                  <h3 className="text-[17px] font-black text-[#5C432E] mb-1">
                    Recipe Reveal
                  </h3>
                  <p className="text-[11px] font-medium text-[#8B7355] mb-2 mt-4">
                    Your group cooked up...
                  </p>
                  <p className="text-base font-black text-[#E8881E] mb-4">
                    {dishName || 'Creamy Herb Chicken Pasta'}
                  </p>
                  <div className="rounded-xl overflow-hidden border border-[#F0E4D4] shadow-sm bg-[#FAF6F0] p-4 relative">
                    {/* Confetti decoration */}
                    <div className="absolute top-2 left-6 w-1.5 h-1.5 rounded-full bg-red-400"></div>
                    <div className="absolute top-4 right-10 w-2 h-2 rounded-sm bg-green-500 rotate-45"></div>
                    <div className="absolute bottom-6 left-4 w-2 h-2 rounded-full bg-yellow-400"></div>
                    <img
                      src={dish1Img}
                      alt="Dish"
                      className="w-full h-44 object-contain"
                    />
                  </div>
                </div>

                {/* Ratings & Reaction */}
                <div className="text-center pt-1">
                  <h3 className="text-[17px] font-black text-[#5C432E] mb-4">
                    Ratings & Reaction
                  </h3>
                  <p className="text-[11px] font-medium text-[#5C432E] mb-5 leading-relaxed">
                    The verdict is in. Other teams have
                    <br />
                    tasted your creation.
                  </p>

                  <p className="text-[11px] font-medium text-[#5C432E] mb-2">
                    Average Rating Received Dish
                  </p>

                  {/* Stars */}
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <Star
                        key={i}
                        size={26}
                        className="text-[#FFC107] fill-[#FFC107]"
                      />
                    ))}
                    <div className="relative w-[26px] h-[26px]">
                      <Star
                        size={26}
                        className="text-[#E0E0E0] fill-[#E0E0E0] absolute inset-0"
                      />
                      <div className="absolute inset-0 overflow-hidden w-1/2">
                        <Star
                          size={26}
                          className="text-[#FFC107] fill-[#FFC107]"
                        />
                      </div>
                    </div>
                    <span className="text-lg font-black text-[#3D2E1F] ml-2">
                      4.5<span className="text-xs font-bold text-[#8B7355] ml-0.5">/5</span>
                    </span>
                  </div>

                  {/* Reactions */}
                  <p className="text-[11px] font-medium text-[#5C432E] mt-6 mb-3">
                    Reactions
                  </p>
                  <div className="flex justify-between gap-2 flex-nowrap w-full">
                    {reactions.map((r) => (
                      <div
                        key={r.label}
                        className="flex flex-col items-center justify-between pt-4 pb-3 px-1 rounded-2xl bg-[#FFFDF9] border border-[#F0DECA] flex-1 min-w-0 h-[120px]"
                      >
                        <div className="w-10 h-10 flex items-center justify-center mb-1">
                          {r.img ? (
                            <img
                              src={r.img}
                              alt={r.label}
                              className="w-full h-full object-contain drop-shadow-md"
                            />
                          ) : (
                            <span className="text-3xl leading-none">{r.emoji}</span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#5C432E] font-medium leading-[1.1] text-center mb-1">
                          {r.label}
                        </span>
                        <span className="text-[22px] font-bold text-[#E8881E] mt-auto leading-none">
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
              <div className="bg-[#F8DEBC] rounded-2xl border border-[#F0D0A5] p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <h3 className="text-[17px] font-black text-[#5C432E] text-center mb-4 relative z-10">
                  The Imposter has been unmarked
                </h3>
                <div className="flex items-center justify-between mt-auto relative z-10">
                  <div className="space-y-4">
                    <p className="text-[13px] text-[#E8881E] font-bold leading-snug">
                      The group has spoken.
                      <br />
                      The most suspected player is
                      <br />
                      <span className="font-black text-[#3D2E1F] text-[15px]">
                        Mark32
                      </span>
                    </p>
                    <div className="text-[32px] drop-shadow-md">😈</div>
                  </div>
                  
                  {/* Stacking the avatars */}
                  <div className="relative w-24 h-32 flex flex-col items-center">
                    <div className="absolute right-0 top-0 w-[60px] h-[75px] rounded-lg overflow-hidden border-2 border-white shadow-md bg-white z-10">
                      <img src={chef4Img} alt="Chef" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute left-0 bottom-4 w-[60px] h-[75px] rounded-lg overflow-hidden border-2 border-white shadow-lg bg-[#222] z-20">
                      <img src={imposterImg} alt="Imposter" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-1 text-center w-full">
                      <span className="block text-[11px] font-black text-[#E8881E] leading-tight">
                        Mark32
                      </span>
                      <span className="block text-[10px] font-bold text-[#5C432E] leading-tight">
                        Chef 4
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fun Awards */}
              <div className="bg-[#F8DEBC] rounded-2xl border border-[#F0D0A5] p-6 shadow-sm flex flex-col">
                <h3 className="text-[17px] font-black text-[#5C432E] text-center mb-5">
                  Fun Awards
                </h3>
                <div className="flex flex-wrap gap-2 justify-center mt-auto">
                  {funAwards.map((award, i) => (
                    <div
                      key={award.title}
                      className={`bg-white rounded-lg px-2 py-3 text-center shadow-sm flex flex-col justify-center ${i === 4 ? 'w-[85%]' : 'flex-1 min-w-[110px]'}`}
                    >
                      <p className="text-[11px] font-black text-[#5C432E] leading-tight mb-1">
                        {award.title}
                      </p>
                      <p className="text-[9px] text-[#8B7355] font-semibold">
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
            <div className="bg-[#FFFDF9] rounded-2xl border border-[#F0DECA] p-6 shadow-sm">
              <h3 className="text-[17px] font-black text-[#5C432E] text-center mb-5">
                What Other Kitchens Cooked Up
              </h3>

              {/* Other group's dish */}
              <div className="flex items-center gap-4 mb-6 bg-white rounded-xl border border-[#F0DECA] p-3 shadow-sm">
                <div className="w-[72px] h-[72px] rounded-xl overflow-hidden border border-[#F5E2C8] shrink-0 bg-[#FAF6F0] p-1">
                  <img
                    src={dish5Img}
                    alt="Other dish"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-[#8B7355] font-medium mb-0.5">
                    Group 6
                  </p>
                  <p className="text-[15px] font-black text-[#3D2E1F] mb-1">
                    Spicy Dragon Delight
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Star
                        size={12}
                        className="text-[#FFC107] fill-[#FFC107]"
                      />
                      <span className="font-bold text-[#3D2E1F]">4.5<span className="text-[#8B7355]"> / 5</span></span>
                    </span>
                    <span className="text-[11px] text-[#8B7355] flex items-center gap-1">
                      <span className="text-sm">🤩</span> 8 Voted Most Delicious
                    </span>
                  </div>
                </div>
              </div>

              {/* Game Steps */}
              <div className="mb-6">
                <h4 className="text-[15px] font-black text-[#E8881E] mb-3">
                  Game Step
                </h4>
                <div className="space-y-4">
                  {gameSteps.map((step) => (
                    <div key={step.label} className="flex items-start gap-4">
                      <span className="text-[15px] font-black text-[#E8881E] shrink-0 w-4 text-center mt-0.5">
                        {step.label}
                      </span>
                      <p className="text-xs text-[#5C432E] leading-relaxed font-medium">
                        {step.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-t border-[#F0DECA] my-5" />

              {/* Give Rating */}
              <div className="text-center mb-5">
                <h4 className="text-[15px] font-black text-[#5C432E] mb-3">
                  Give Rating
                </h4>
                <div className="flex items-center justify-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      onClick={() => setUserRating(i)}
                      className="cursor-pointer transition-transform hover:scale-110 px-0.5"
                    >
                      <Star
                        size={26}
                        className={
                          i <= userRating
                            ? 'text-[#FFC107] fill-[#FFC107]'
                            : 'text-[#D4C5B3] fill-[#D4C5B3]'
                        }
                      />
                    </button>
                  ))}
                  <span className="text-lg font-black text-[#3D2E1F] ml-3">
                    {userRating}
                    <span className="text-sm font-bold text-[#8B7355] ml-1">/ 5</span>
                  </span>
                </div>
              </div>

              {/* Rating Badges */}
              <div className="flex justify-between gap-2.5 flex-nowrap w-full pb-2">
                {ratingBadges.map((badge, i) => (
                  <button
                    key={badge.label}
                    onClick={() => setSelectedBadge(i)}
                    className={`
                      flex flex-col items-center justify-start pt-3.5 pb-2 px-1 rounded-2xl border-2 transition-all cursor-pointer flex-1 min-w-0 h-[115px]
                      ${
                        selectedBadge === i
                          ? 'border-[#E8881E] bg-[#FFFDF9] shadow-sm'
                          : 'border-[#F0DECA] bg-[#FFFDF9] hover:border-[#E8881E]/50'
                      }
                    `}
                  >
                    <div className="w-11 h-11 flex items-center justify-center mb-2 shrink-0">
                      <img
                        src={badge.img}
                        alt={badge.label}
                        className="w-full h-full object-contain drop-shadow-md"
                      />
                    </div>
                    <span className="text-[10px] font-medium text-[#5C432E] leading-[1.2] text-center px-0.5">
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
