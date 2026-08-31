'use client';

import React, { useState } from 'react';
import { Star, CheckCircle, ThumbsUp, ThumbsDown, PenSquare, X, ChevronDown } from 'lucide-react';
import { ProductReview } from '@/data/mockData';

interface ProductReviewsProps {
  rating: number;
  reviewsCount: number;
  reviewItems?: ProductReview[];
}

const REVIEW_SORT_OPTIONS = ['Most Recent', 'Highest Rated', 'Lowest Rated', 'Most Helpful'];

export const ProductReviewsSection: React.FC<ProductReviewsProps> = ({
  rating,
  reviewsCount,
  reviewItems = [],
}) => {
  const [sortBy, setSortBy] = useState('Most Recent');
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [localReviews, setLocalReviews] = useState<ProductReview[]>(reviewItems);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, 'up' | 'down' | null>>({});
  const [showAll, setShowAll] = useState(false);

  // Write Review Form State
  const [formRating, setFormRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Rating breakdown calculation
  const ratingBreakdown = [5, 4, 3, 2, 1].map(stars => {
    const count = localReviews.filter(r => Math.round(r.rating) === stars).length || 0;
    const pct = localReviews.length > 0 ? Math.round((count / localReviews.length) * 100) : 0;
    return { stars, count, pct };
  });

  // Sorted reviews
  const sortedReviews = [...localReviews].sort((a, b) => {
    if (sortBy === 'Highest Rated') return b.rating - a.rating;
    if (sortBy === 'Lowest Rated') return a.rating - b.rating;
    return 0; // Most Recent & Most Helpful — default order
  });

  const visibleReviews = showAll ? sortedReviews : sortedReviews.slice(0, 3);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formComment.trim()) return;

    const newReview: ProductReview = {
      id: `rev-${Date.now()}`,
      author: formName.trim(),
      role: formRole.trim() || 'Verified Buyer',
      rating: formRating,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      comment: formComment.trim(),
      verified: true,
    };

    setLocalReviews(prev => [newReview, ...prev]);
    setFormSubmitted(true);
    setTimeout(() => {
      setShowWriteForm(false);
      setFormSubmitted(false);
      setFormName(''); setFormRole(''); setFormComment(''); setFormRating(5);
    }, 2500);
  };

  const handleHelpful = (reviewId: string, vote: 'up' | 'down') => {
    setHelpfulVotes(prev => ({
      ...prev,
      [reviewId]: prev[reviewId] === vote ? null : vote,
    }));
  };

  return (
    <section id="reviews" className="space-y-8 border-t border-slate-200 pt-10 text-slate-900">

      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Customer Reviews</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified feedback from university researchers, engineers, and STEM educators.
          </p>
        </div>
        <button
          onClick={() => setShowWriteForm(true)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-[#00AEEF] text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl transition-all active:scale-95 shadow-md cursor-pointer whitespace-nowrap"
        >
          <PenSquare className="w-4 h-4" />
          Write a Review
        </button>
      </div>

      {/* ── Rating Summary Block ── */}
      <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 border border-slate-200 rounded-3xl p-6">

        {/* Overall Score */}
        <div className="flex flex-col items-center justify-center shrink-0 min-w-[120px] gap-1">
          <span className="text-5xl font-black text-slate-900">{rating.toFixed(1)}</span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
              <Star
                key={s}
                className={`w-4 h-4 ${s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
              />
            ))}
          </div>
          <span className="text-[11px] font-bold text-slate-500">{reviewsCount} Reviews</span>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px bg-slate-200 self-stretch" />
        <div className="block sm:hidden h-px bg-slate-200 w-full" />

        {/* Breakdown Bars */}
        <div className="flex-1 space-y-2">
          {ratingBreakdown.map(({ stars, count, pct }) => (
            <div key={stars} className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600 w-3 text-right shrink-0">{stars}</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-500 w-8 text-right shrink-0">
                {count > 0 ? `${pct}%` : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sort + Filter Bar ── */}
      {localReviews.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-500">
            Showing <strong className="text-slate-900">{visibleReviews.length}</strong> of{' '}
            <strong className="text-slate-900">{localReviews.length}</strong> reviews
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold hidden sm:block">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#00AEEF] cursor-pointer"
            >
              {REVIEW_SORT_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ── Review Cards ── */}
      <div className="space-y-4 max-w-4xl">
        {localReviews.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-3xl border border-slate-200">
            <Star className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-500">No reviews yet for this product.</p>
            <p className="text-xs text-slate-400 mt-1">Be the first to share your experience!</p>
            <button
              onClick={() => setShowWriteForm(true)}
              className="mt-4 bg-[#00AEEF] text-white text-xs font-black px-4 py-2 rounded-xl cursor-pointer"
            >
              Write a Review
            </button>
          </div>
        ) : (
          <>
            {visibleReviews.map(rev => (
              <div
                key={rev.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all"
              >
                {/* Review Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00AEEF] to-[#0096D6] flex items-center justify-center text-white text-xs font-black shrink-0">
                      {rev.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-extrabold text-slate-900">{rev.author}</span>
                        {rev.verified && (
                          <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                            <CheckCircle className="w-2.5 h-2.5" /> Verified Purchase
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-medium text-slate-400">{rev.role}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold shrink-0">{rev.date}</span>
                </div>

                {/* Star Rating */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
                    />
                  ))}
                  <span className="text-[10px] text-slate-500 font-bold ml-1">{rev.rating.toFixed(1)}</span>
                </div>

                {/* Review Comment */}
                <p className="text-xs text-slate-700 leading-relaxed italic border-l-2 border-[#00AEEF]/30 pl-3">
                  &ldquo;{rev.comment}&rdquo;
                </p>

                {/* Helpful / Not Helpful */}
                <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold">Was this helpful?</span>
                  <button
                    onClick={() => handleHelpful(rev.id, 'up')}
                    className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      helpfulVotes[rev.id] === 'up'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" /> Yes
                  </button>
                  <button
                    onClick={() => handleHelpful(rev.id, 'down')}
                    className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      helpfulVotes[rev.id] === 'down'
                        ? 'bg-red-100 text-red-600'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <ThumbsDown className="w-3 h-3" /> No
                  </button>
                </div>
              </div>
            ))}

            {/* Show More / Less */}
            {localReviews.length > 3 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full text-center text-xs font-extrabold text-[#00AEEF] hover:text-[#0096D6] py-3 border border-[#00AEEF]/30 rounded-2xl hover:bg-[#E0F7FC] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
                {showAll ? 'Show Fewer Reviews' : `View All ${localReviews.length} Reviews`}
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Write Review Modal ── */}
      {showWriteForm && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-lg shadow-2xl overflow-hidden my-8">

            <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#00AEEF]">CUSTOMER REVIEW</span>
                <h3 className="text-lg font-black">Write Your Review</h3>
              </div>
              <button
                onClick={() => setShowWriteForm(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formSubmitted ? (
              <div className="p-10 flex flex-col items-center gap-3 text-center">
                <CheckCircle className="w-14 h-14 text-emerald-500" />
                <h4 className="text-base font-extrabold text-slate-900">Review Submitted!</h4>
                <p className="text-xs text-slate-500">Your review has been published. Thank you for your feedback!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="p-6 space-y-5 text-xs">

                {/* Star Rating Selector */}
                <div className="space-y-2">
                  <label className="block font-extrabold text-slate-700 uppercase tracking-wider">
                    Your Rating *
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        type="button"
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setFormRating(s)}
                        className="cursor-pointer p-0.5"
                      >
                        <Star
                          className={`w-8 h-8 transition-all ${
                            s <= (hoverRating || formRating)
                              ? 'fill-amber-400 text-amber-400 scale-110'
                              : 'fill-slate-200 text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 font-bold text-slate-600">
                      {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hoverRating || formRating]}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-extrabold text-slate-700 uppercase mb-1">Name *</label>
                    <input
                      required
                      type="text"
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-[#00AEEF]"
                    />
                  </div>
                  <div>
                    <label className="block font-extrabold text-slate-700 uppercase mb-1">Role / Org</label>
                    <input
                      type="text"
                      value={formRole}
                      onChange={e => setFormRole(e.target.value)}
                      placeholder="e.g. Robotics Hobbyist"
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-[#00AEEF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Your Review *</label>
                  <textarea
                    required
                    value={formComment}
                    onChange={e => setFormComment(e.target.value)}
                    rows={4}
                    placeholder="Share your experience with this product — what project did you use it for? How was the quality and performance?"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-[#00AEEF] leading-relaxed resize-none"
                  />
                  <span className="text-[10px] text-slate-400 font-medium">{formComment.length} / 500 characters</span>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowWriteForm(false)}
                    className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-wider shadow-md shadow-[#00AEEF]/20 active:scale-95 cursor-pointer"
                  >
                    Publish Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
