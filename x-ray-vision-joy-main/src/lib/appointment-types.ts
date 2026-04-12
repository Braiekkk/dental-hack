export const APPOINTMENT_TYPES = [
  {
    id: "routine-checkup",
    name: "Routine check-up",
    description: "Clinical examination and preventive assessment.",
  },
  {
    id: "dental-cleaning",
    name: "Dental cleaning",
    description: "Plaque and tartar removal with polishing.",
  },
  {
    id: "filling",
    name: "Filling",
    description: "Restoration of carious teeth with filling material.",
  },
  {
    id: "emergency-visit",
    name: "Emergency visit",
    description: "Urgent pain, swelling, or infection treatment.",
  },
  {
    id: "tooth-extraction",
    name: "Tooth extraction",
    description: "Planned or urgent removal of a tooth.",
  },
] as const;

export type AppointmentTypeName = (typeof APPOINTMENT_TYPES)[number]["name"];
