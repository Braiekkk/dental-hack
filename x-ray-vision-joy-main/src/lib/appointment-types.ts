export const APPOINTMENT_TYPES = [
  {
    id: "routine-checkup",
    name: "Routine check-up (examination)",
    description: "Clinical examination and preventive assessment.",
  },
  {
    id: "dental-cleaning",
    name: "Dental cleaning (scaling)",
    description: "Plaque and tartar removal with polishing.",
  },
  {
    id: "filling",
    name: "Filling (cavity treatment)",
    description: "Restoration of carious teeth with filling material.",
  },
  {
    id: "emergency-visit",
    name: "Emergency visit (pain/infection)",
    description: "Urgent pain, swelling, or infection treatment.",
  },
  {
    id: "tooth-extraction",
    name: "Tooth extraction",
    description: "Planned or urgent removal of a tooth.",
  },
] as const;

export type AppointmentTypeName = (typeof APPOINTMENT_TYPES)[number]["name"];
