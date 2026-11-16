export const MONTHS = [
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

export const getAvailableYears = (range: number = 2): number[] => {
  const currentYear = new Date().getFullYear();

  return Array.from(
    { length: range * 2 + 1 },
    (_, index) => currentYear - range + index,
  );
};
