import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { BookOpen, Heart, Users, Calendar, Sparkles, HeadphonesIcon } from 'lucide-react'
import { FeaturedLessons } from '@/components/home/featured-lessons'
import { redirect } from 'next/navigation'

export default async function Home({
  searchParams,
}: {
  searchParams: { code?: string; ref?: string }
}) {
  // If there's a code parameter, redirect to the auth callback route
  if (searchParams.code) {
    const params = new URLSearchParams()
    params.set('code', searchParams.code)
    if (searchParams.ref) {
      params.set('ref', searchParams.ref)
    }
    redirect(`/auth/callback?${params.toString()}`)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-sandstone">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-lg border-b border-olivewood/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Image
                src="/my-daily-break-logo.png"
                alt="My Daily Bread Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="text-xl font-heading font-bold text-charcoal">
                My Daily Bread
              </span>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-olivewood text-white rounded-lg hover:bg-olivewood/90 transition-colors font-sans"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-olivewood hover:text-olivewood/80 transition-colors font-sans"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 bg-olivewood text-white rounded-lg hover:bg-olivewood/90 transition-colors font-sans"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(90deg, transparent 24%, rgba(165, 154, 126, .02) 25%, rgba(165, 154, 126, .02) 26%, transparent 27%, transparent 74%, rgba(165, 154, 126, .02) 75%, rgba(165, 154, 126, .02) 76%, transparent 77%, transparent),
              linear-gradient(0deg, transparent 24%, rgba(165, 154, 126, .02) 25%, rgba(165, 154, 126, .02) 26%, transparent 27%, transparent 74%, rgba(165, 154, 126, .02) 75%, rgba(165, 154, 126, .02) 76%, transparent 77%, transparent)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              {/* IMAGE PLACEHOLDER: Hero illustration or photo */}
              <div className="w-32 h-32 bg-golden-wheat/20 rounded-2xl flex items-center justify-center border-2 border-golden-wheat/30">
                <Image
                  src="/my-daily-break-logo.png"
                  alt="My Daily Bread"
                  width={96}
                  height={96}
                  className="w-24 h-24"
                />
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-heading font-bold text-charcoal mb-6 tracking-tight">
              Daily Nourishment
              <br />
              <span className="text-olivewood">for the Soul</span>
            </h1>
            <p className="text-xl sm:text-2xl text-charcoal/70 font-serif italic mb-4 max-w-3xl mx-auto">
              "Man shall not live by bread alone, but by every word that proceeds from the mouth of God."
            </p>
            <p className="text-base text-charcoal/60 font-sans mb-8 max-w-2xl mx-auto">
              Matthew 4:4
            </p>
            <p className="text-lg sm:text-xl text-charcoal/80 font-sans mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform your faith journey with personalized Bible study plans, daily lessons with audio narration,
              and a supportive community to keep you growing in Christ.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 bg-olivewood text-white text-lg rounded-lg hover:bg-olivewood/90 transition-all shadow-lg hover:shadow-xl font-sans"
              >
                Start Your Journey
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-4 bg-white text-olivewood text-lg rounded-lg border-2 border-olivewood/30 hover:border-olivewood transition-all shadow-lg font-sans"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* What is My Daily Bread */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Image
                src="/what-is-my-daily-bread.png"
                alt="Person studying Bible with coffee and phone"
                width={600}
                height={450}
                className="w-full rounded-2xl shadow-lg"
                priority
              />
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl font-heading font-bold text-charcoal mb-6">
                What is My Daily Bread?
              </h2>
              <p className="text-lg text-charcoal/80 font-sans mb-6 leading-relaxed">
                My Daily Bread is more than just a Bible reading app—it's your personal spiritual growth companion.
                We help you build a consistent, meaningful practice of engaging with Scripture through structured
                study plans, daily lessons, and audio narration.
              </p>
              <p className="text-lg text-charcoal/80 font-sans mb-6 leading-relaxed">
                Whether you're seeking to deepen your faith, grow closer to Jesus, or strengthen your family's
                spiritual foundation, My Daily Bread provides the tools and community support you need to thrive.
              </p>
              <div className="flex items-start gap-3 p-4 bg-golden-wheat/10 rounded-lg border border-golden-wheat/30">
                <Heart className="w-6 h-6 text-golden-wheat flex-shrink-0 mt-1" />
                <p className="text-charcoal/80 font-sans">
                  <strong>Our Mission:</strong> To make daily Bible study accessible, engaging, and transformative
                  for believers of all ages and backgrounds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-sandstone">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-heading font-bold text-charcoal mb-4">
              How It Works
            </h2>
            <p className="text-lg text-charcoal/70 font-sans max-w-2xl mx-auto">
              Getting started with your daily spiritual practice is simple and takes just minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white/90 rounded-xl p-8 shadow-lg border border-olivewood/20 text-center">
              <div className="flex items-center justify-center mx-auto mb-6">
                <Image
                  src="/how-it-works-1.webp"
                  alt="Choose Your Plan"
                  width={120}
                  height={120}
                  className="w-28 h-28"
                />
              </div>
              <h3 className="text-2xl font-heading font-bold text-charcoal mb-4">
                Choose Your Plan
              </h3>
              <p className="text-charcoal/70 font-sans leading-relaxed">
                Select from pre-made plans, use our Guided Builder for personalized suggestions, or import your own
                custom study plan. We have options for every spiritual journey.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white/90 rounded-xl p-8 shadow-lg border border-olivewood/20 text-center">
              <div className="flex items-center justify-center mx-auto mb-6">
                <Image
                  src="/how-it-works-2.webp"
                  alt="Engage Daily"
                  width={120}
                  height={120}
                  className="w-28 h-28"
                />
              </div>
              <h3 className="text-2xl font-heading font-bold text-charcoal mb-4">
                Engage Daily
              </h3>
              <p className="text-charcoal/70 font-sans leading-relaxed">
                Receive daily lessons with Scripture readings, audio narration, reflection questions, and quizzes to
                deepen your understanding and application.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white/90 rounded-xl p-8 shadow-lg border border-olivewood/20 text-center">
              <div className="flex items-center justify-center mx-auto mb-6">
                <Image
                  src="/how-it-works-3.webp"
                  alt="Grow Together"
                  width={120}
                  height={120}
                  className="w-28 h-28"
                />
              </div>
              <h3 className="text-2xl font-heading font-bold text-charcoal mb-4">
                Grow Together
              </h3>
              <p className="text-charcoal/70 font-sans leading-relaxed">
                Share plans with friends and family, invite others to join your study, and grow in faith together
                with the support of a loving community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-heading font-bold text-charcoal mb-4">
              Everything You Need to Thrive
            </h2>
            <p className="text-lg text-charcoal/70 font-sans max-w-2xl mx-auto">
              Powerful features designed to support your spiritual growth
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-xl bg-sandstone/50 border border-olivewood/20">
              <div className="w-12 h-12 bg-olivewood/10 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-olivewood" />
              </div>
              <h3 className="text-xl font-heading font-bold text-charcoal mb-3">
                Guided Plan Builder
              </h3>
              <p className="text-charcoal/70 font-sans">
                Get personalized Bible study suggestions based on your interests, goals, and spiritual season.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-xl bg-sandstone/50 border border-olivewood/20">
              <div className="w-12 h-12 bg-olivewood/10 rounded-lg flex items-center justify-center mb-4">
                <HeadphonesIcon className="w-6 h-6 text-olivewood" />
              </div>
              <h3 className="text-xl font-heading font-bold text-charcoal mb-3">
                Audio Narration
              </h3>
              <p className="text-charcoal/70 font-sans">
                Listen to lessons with professional audio narration—perfect for commutes, workouts, or winding down.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-xl bg-sandstone/50 border border-olivewood/20">
              <div className="w-12 h-12 bg-olivewood/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-olivewood" />
              </div>
              <h3 className="text-xl font-heading font-bold text-charcoal mb-3">
                Flexible Scheduling
              </h3>
              <p className="text-charcoal/70 font-sans">
                Set your own pace with self-guided plans or follow structured schedules—whatever works for your life.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-xl bg-sandstone/50 border border-olivewood/20">
              <div className="w-12 h-12 bg-olivewood/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-olivewood" />
              </div>
              <h3 className="text-xl font-heading font-bold text-charcoal mb-3">
                Community & Sharing
              </h3>
              <p className="text-charcoal/70 font-sans">
                Invite friends and family to join your plans, share progress, and encourage one another in faith.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-xl bg-sandstone/50 border border-olivewood/20">
              <div className="w-12 h-12 bg-olivewood/10 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-olivewood" />
              </div>
              <h3 className="text-xl font-heading font-bold text-charcoal mb-3">
                Interactive Lessons
              </h3>
              <p className="text-charcoal/70 font-sans">
                Engage with Scripture through reflection questions, quizzes, and practical application exercises.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-xl bg-sandstone/50 border border-olivewood/20">
              <div className="w-12 h-12 bg-olivewood/10 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-olivewood" />
              </div>
              <h3 className="text-xl font-heading font-bold text-charcoal mb-3">
                Family Focused
              </h3>
              <p className="text-charcoal/70 font-sans">
                Build spiritual habits together as a family with plans designed for all ages and faith stages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Lessons (Public Preview) */}
      <FeaturedLessons />

      {/* Final CTA */}
      <section className="py-20 bg-olivewood text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-heading font-bold mb-6">
            Begin Your Journey Today
          </h2>
          <p className="text-xl text-white/90 font-sans mb-8 leading-relaxed">
            Join thousands of believers who are growing deeper in their faith with My Daily Bread.
            Your daily spiritual nourishment is just a click away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-white text-olivewood text-lg rounded-lg hover:bg-sandstone transition-all shadow-lg font-sans"
            >
              Get Started Free
            </Link>
            <Link
              href="/library"
              className="px-8 py-4 bg-olivewood/80 text-white text-lg rounded-lg border-2 border-white/50 hover:bg-olivewood hover:border-white transition-all font-sans"
            >
              Browse Plans
            </Link>
          </div>
          <p className="text-sm text-white/70 font-sans mt-8">
            Free to use. No credit card required. Start growing today.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/my-daily-break-logo.png"
                  alt="My Daily Bread"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span className="font-heading font-bold">My Daily Bread</span>
              </div>
              <p className="text-white/70 font-sans text-sm">
                Daily nourishment for the soul
              </p>
            </div>
            <div>
              <h4 className="font-heading font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm font-sans">
                <li>
                  <Link href="/library" className="text-white/70 hover:text-white transition-colors">
                    Browse Plans
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-white/70 hover:text-white transition-colors">
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm font-sans">
                <li>
                  <a href="mailto:support@mydailybread.faith" className="text-white/70 hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-bold mb-4">Scripture</h4>
              <p className="text-white/70 font-sans text-sm italic">
                "Give us this day our daily bread" - Matthew 6:11
              </p>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center">
            <p className="text-white/60 font-sans text-sm">
              © {new Date().getFullYear()} My Daily Bread. Built with love for the glory of God.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
