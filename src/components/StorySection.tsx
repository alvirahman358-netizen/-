interface StorySectionProps {
  eyebrow: string;
  headline: string;
  description: string;
}

export function StorySection({
  eyebrow,
  headline,
  description,
}: StorySectionProps) {
  return (
    <section
      id="story"
      className="scroll-mt-20 border-t border-stone-200 py-14 sm:py-20"
      style={{ backgroundColor: 'var(--brand-surface)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-7">
            <p className="text-sm font-medium text-[var(--brand-accent)] mb-2">
              {eyebrow}
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-snug mb-4"
              style={{
                fontFamily: 'var(--font-display)',
                textWrap: 'balance',
              }}
            >
              {headline}
            </h2>
            <p className="text-base text-stone-700 leading-relaxed max-w-2xl">
              {description}
            </p>
          </div>

          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-6 border-t lg:border-t-0 lg:border-l border-stone-300/80 pt-6 lg:pt-0 lg:pl-8">
            <div>
              <p
                className="text-2xl font-bold text-zinc-900 tabular-nums"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                ৫০০+ দেশীয় কারিগর
              </p>
              <p className="text-sm text-stone-600 mt-1">
                নারায়ণগঞ্জ, রংপুর, কুমিল্লা ও সিলেটের কর্মশালা থেকে সরাসরি সংগ্রহ
              </p>
            </div>
            <div>
              <p
                className="text-2xl font-bold text-zinc-900 tabular-nums"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                ৪৮ ঘণ্টায় ডেলিভারি
              </p>
              <p className="text-sm text-stone-600 mt-1">
                ঢাকা মেট্রোতে ৪৮ ঘণ্টায় এবং সারা দেশে ৩–৫ কর্মদিবসে পৌঁছায়
              </p>
            </div>
            <div>
              <p
                className="text-2xl font-bold text-zinc-900 tabular-nums"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                ১০০% যাচাইকৃত মান
              </p>
              <p className="text-sm text-stone-600 mt-1">
                প্রতিটি চালান পাঠানোর আগে হাতে কলমে মান পরীক্ষা করা হয়
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
