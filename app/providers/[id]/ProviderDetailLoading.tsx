/**
 * Full-page loading skeleton for provider detail page
 */
export function ProviderDetailLoading() {
  return (
    <>
      {/* Hero Section Skeleton */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Breadcrumb */}
          <div className="h-5 bg-gray-200 rounded w-64 mb-6 animate-pulse" />

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Profile Image */}
            <div className="w-full lg:w-80 h-64 lg:h-80 bg-gray-200 rounded-2xl animate-pulse" />

            {/* Provider Info */}
            <div className="flex-1 space-y-4">
              {/* Title */}
              <div className="h-10 bg-gray-200 rounded w-3/4 animate-pulse" />

              {/* Categories */}
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded-full w-24 animate-pulse" />
                <div className="h-8 bg-gray-200 rounded-full w-28 animate-pulse" />
                <div className="h-8 bg-gray-200 rounded-full w-20 animate-pulse" />
              </div>

              {/* Location */}
              <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />

              {/* Rating */}
              <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />

              {/* Stats */}
              <div className="h-24 bg-gray-200 rounded-xl animate-pulse" />

              {/* CTA Button */}
              <div className="h-14 bg-gray-200 rounded-xl w-64 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Skeleton */}
      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
                <div className="h-8 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                </div>
              </div>

              {/* Services Section */}
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
                <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="h-5 bg-gray-200 rounded w-48 animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                      </div>
                      <div className="h-10 bg-gray-200 rounded-lg w-28 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
                <div className="h-8 bg-gray-200 rounded w-56 mb-6 animate-pulse" />
                <div className="h-24 bg-gray-200 rounded-xl mb-6 animate-pulse" />
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Booking Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="h-7 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
                <div className="space-y-3 mb-6">
                  <div className="h-5 bg-gray-200 rounded w-36 animate-pulse" />
                  <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
                  <div className="h-5 bg-gray-200 rounded w-28 animate-pulse" />
                </div>
                <div className="h-14 bg-gray-200 rounded-xl animate-pulse" />
              </div>

              {/* Contact Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="h-7 bg-gray-200 rounded w-44 mb-4 animate-pulse" />
                <div className="space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-full animate-pulse" />
                  <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Related Providers */}
          <div className="mt-12">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100"
                >
                  <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                    <div className="h-10 bg-gray-200 rounded-xl animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

