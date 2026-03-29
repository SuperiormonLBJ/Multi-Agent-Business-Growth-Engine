import { motion } from 'framer-motion'
import type { LeadData, Review } from '../../../../shared/types'
import { Star } from 'lucide-react'

interface Props {
  lead: Pick<LeadData, 'rating' | 'reviewCount' | 'reviews' | 'businessName'>
}

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < count ? 'text-theme-primary fill-theme-primary' : 'text-slate-200 fill-slate-200'
          }`}
        />
      ))}
    </div>
  )
}

function ReviewerAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div className="w-9 h-9 rounded-full bg-theme-primary/10 text-theme-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
      {initial}
    </div>
  )
}

function FeaturedReview({ review }: { review: Review }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl p-8 border-t-2 border-theme-primary shadow-sm"
    >
      <StarRow count={review.rating} />
      <p className="mt-4 text-slate-800 text-lg leading-relaxed">
        &ldquo;{review.text}&rdquo;
      </p>
      <div className="mt-6 flex items-center gap-3">
        <ReviewerAvatar name={review.reviewer} />
        <div>
          <p className="text-sm font-semibold text-slate-900">{review.reviewer}</p>
          {review.relativeTime && (
            <p className="text-xs text-slate-400">{review.relativeTime} · Google</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function SmallReview({ review, delay }: { review: Review; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.3 }}
      className="bg-white rounded-lg p-5 border border-slate-100"
    >
      <StarRow count={review.rating} />
      <p className="mt-3 text-slate-700 text-sm leading-relaxed line-clamp-3">
        &ldquo;{review.text}&rdquo;
      </p>
      <div className="mt-4 flex items-center gap-2">
        <ReviewerAvatar name={review.reviewer} />
        <div>
          <p className="text-xs font-semibold text-slate-900">{review.reviewer}</p>
          {review.relativeTime && (
            <p className="text-xs text-slate-400">{review.relativeTime}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const FALLBACK_REVIEWS: Review[] = [
  {
    reviewer: 'Verified Customer',
    rating: 5,
    text: 'Excellent service. Fast response, professional work, and fair pricing. Would highly recommend to anyone looking for reliable help.',
    relativeTime: 'Recent',
  },
  {
    reviewer: 'Happy Client',
    rating: 5,
    text: 'Called for an emergency and they were at my door within the hour. Fixed everything properly the first time. Very impressed.',
    relativeTime: 'Recent',
  },
  {
    reviewer: 'Local Resident',
    rating: 5,
    text: 'Best in the area. Explained everything upfront, no hidden fees, and cleaned up completely after the job was done.',
    relativeTime: 'Recent',
  },
]

const SHOWCASE_MAX = 10

export default function Reviews({ lead }: Props) {
  const { rating, reviewCount, reviews, businessName } = lead
  const displayReviews =
    reviews.length > 0 ? reviews.slice(0, SHOWCASE_MAX) : FALLBACK_REVIEWS.slice(0, 3)
  const [featured, ...supporting] = displayReviews

  return (
    <section className="bg-slate-50 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-10">
          <div className="flex-1">
            <span className="text-xs font-semibold tracking-widest text-theme-primary uppercase">
              Customer Reviews
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900">
              What People Are Saying
            </h2>
          </div>
          {/* Google badge */}
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-2.5 self-start sm:self-auto">
            <Star className="w-5 h-5 text-theme-primary fill-theme-primary" />
            <div>
              <span className="text-xl font-black text-slate-900">{rating.toFixed(1)}</span>
              <p className="text-xs text-slate-500">{reviewCount.toLocaleString()} Google reviews</p>
            </div>
          </div>
        </div>

        {/* Featured + supporting layout */}
        <div className="space-y-4">
          {featured && <FeaturedReview review={featured} />}
          {supporting.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {supporting.map((review, i) => (
                <SmallReview key={i} review={review} delay={0.05 * (i + 1)} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(businessName + ' reviews')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-500 hover:text-theme-primary transition-colors underline underline-offset-4"
          >
            See all reviews on Google →
          </a>
        </div>
      </div>
    </section>
  )
}
