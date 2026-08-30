export const MUSCLE_GROUPS = [
  "Petto",
  "Schiena",
  "Spalle",
  "Bicipiti",
  "Tricipiti",
  "Avambracci",
  "Addome",
  "Quadricipiti",
  "Femorali",
  "Glutei",
  "Polpacci",
  "Mobilità/Altro",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export function isMuscleGroup(value: string): value is MuscleGroup {
  return (MUSCLE_GROUPS as readonly string[]).includes(value);
}
