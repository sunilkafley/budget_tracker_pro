import { Frequency } from "../domain/enums/Frequency";

export const frequencyAdvancers = {
  [Frequency.WEEKLY]: (date: Date): Date => {
    const updatedDate = new Date(date);

    updatedDate.setDate(updatedDate.getDate() + 7);

    return updatedDate;
  },

  [Frequency.MONTHLY]: (date: Date): Date => {
    const updatedDate = new Date(date);

    updatedDate.setMonth(updatedDate.getMonth() + 1);

    return updatedDate;
  },

  [Frequency.YEARLY]: (date: Date): Date => {
    const updatedDate = new Date(date);

    updatedDate.setFullYear(updatedDate.getFullYear() + 1);

    return updatedDate;
  },
};
