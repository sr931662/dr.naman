export const DEFAULT_BADGE = {
  primary: "Dr. Aggarwal's Clinic",
  secondary: 'Also Consults Here',
  oncall: 'On-Call',
}

// TODO: placeholder — no verified address/phone/hours for Men's Health Corner were
// available yet; update via CMS → Clinic Locations.
export const LOCATIONS_FALLBACK = [
  {
    kind: 'primary',
    name: "Men's Health Corner",
    addressLine: 'Address to be confirmed',
    city: 'Delhi',
    schedule: [{ days: 'Add via CMS', hours: 'Hours to be confirmed' }],
    directions: [],
  },
  {
    kind: 'secondary',
    name: 'Manipal Hospital, Dwarka',
    addressLine: 'Palam Vihar Colony, Sector 6, Dwarka, Delhi',
    landmark: 'Near MTNL Office',
    schedule: [
      { days: 'Tue & Sat', hours: '9:00 AM – 3:00 PM' },
      { days: 'Wed & Thu', hours: '11:00 AM – 3:00 PM' },
    ],
    consultationFee: 1500,
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.151058565209!2d77.06684367614186!3d28.595244775685092!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1b3ae0cf4f6f%3A0xec55552f03c1526d!2sManipal%20Hospital%20Delhi!5e0!3m2!1sen!2sin!4v1782467063048!5m2!1sen!2sin',
    mapLink: 'https://maps.google.com/?q=Manipal+Hospital+Dwarka+Delhi',
  },
  {
    kind: 'secondary',
    name: 'Veena Nursing Home',
    badgeLabel: 'His Own Hospital',
    addressLine: 'Pocket A-1, Sector 8, Near Deepali Chowk, Delhi',
    schedule: [{ days: 'Mon–Sat', hours: '6:30–8:30 AM & 7:00–9:00 PM' }],
    consultationFee: 1000,
  },
  {
    kind: 'oncall',
    name: 'Maharaja Agarsain Hospital',
    addressLine: 'D Block, Ashok Vihar Phase 1, Delhi',
    schedule: [{ days: 'On-call basis', hours: '' }],
  },
]
