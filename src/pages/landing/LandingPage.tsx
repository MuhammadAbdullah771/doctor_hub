import { PublicLayout } from '@/layouts/PublicLayout'
import { usePageSeo } from '@/hooks/use-page-seo'
import { HeroSection } from '@/pages/landing/sections/HeroSection'
import { SearchDoctorsSection } from '@/pages/landing/sections/SearchDoctorsSection'
import { CategoriesSection } from '@/pages/landing/sections/CategoriesSection'
import { TreatmentTypesSection } from '@/pages/landing/sections/TreatmentTypesSection'
import { FeaturedDoctorsSection } from '@/pages/landing/sections/FeaturedDoctorsSection'
import { HowItWorksSection } from '@/pages/landing/sections/HowItWorksSection'
import { TestimonialsSection } from '@/pages/landing/sections/TestimonialsSection'
import { FAQSection } from '@/pages/landing/sections/FAQSection'
import { FooterSection } from '@/pages/landing/sections/FooterSection'

export function LandingPage() {
  usePageSeo({
    title: 'Home',
    description: 'Find top doctors in Karachi, Lahore, Islamabad and across Pakistan. Book appointments online.',
  })

  return (
    <PublicLayout>
      <HeroSection />
      <SearchDoctorsSection />
      <CategoriesSection />
      <TreatmentTypesSection />
      <FeaturedDoctorsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FAQSection />
      <FooterSection />
    </PublicLayout>
  )
}
