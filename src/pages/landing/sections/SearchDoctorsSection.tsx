import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MapPin, Search, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { FEATURED_DISEASES } from '@/constants/doctor-types'
import { PAKISTAN_CITIES } from '@/constants/pakistan-cities'
import { SectionHeader, SectionShell } from '@/components/common/SectionShell'
import { scaleIn } from '@/lib/motion'

export function SearchDoctorsSection() {
  return (
    <SectionShell id="search" variant="blue">
      <SectionHeader
        eyebrow="Smart Search"
        title="Find the Right Doctor in Seconds"
        description="Search by condition, specialty, or city across Karachi, Lahore, Islamabad and more."
      />

      <motion.div
        variants={scaleIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-4xl mx-auto"
      >
        <div className="glass glow-primary rounded-2xl p-8 md:p-10 border border-white/60">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="disease-search" className="text-sm font-semibold flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />
                Disease or condition
              </Label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="disease-search" placeholder="e.g. Diabetes, Hypertension" className="pl-11 h-14 text-base" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city-search" className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-secondary" />
                City in Pakistan
              </Label>
              <Select
                id="city-search"
                placeholder="Select city"
                className="h-14 text-base rounded-xl"
                options={PAKISTAN_CITIES.map((c) => ({ value: c, label: c }))}
              />
            </div>
          </div>
          <Button size="lg" className="w-full md:w-auto min-w-[200px] h-14 text-base" asChild>
            <Link to="/doctors">
              <Search className="h-4 w-4" />
              Search Doctors
            </Link>
          </Button>

          <div className="mt-8 pt-6 border-t border-border/50 flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-muted-foreground mr-2">Popular:</span>
            {FEATURED_DISEASES.slice(0, 5).map((disease) => (
              <Link
                key={disease}
                to={`/doctors?disease=${encodeURIComponent(disease)}`}
                className="rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105"
              >
                {disease}
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </SectionShell>
  )
}
