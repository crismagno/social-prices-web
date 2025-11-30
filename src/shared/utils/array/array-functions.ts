const compareByName =
  <T>(sortField: keyof T, sortOrder: "asc" | "desc" = "asc") =>
  (a: any, b: any) => {
    let nameA = a[sortField].toUpperCase();
    let nameB = b[sortField].toUpperCase();

    if (sortOrder === "desc") {
      nameA = b[sortField].toUpperCase();
      nameB = a[sortField].toUpperCase();
    }

    if (nameA < nameB) {
      return -1;
    }

    if (nameA > nameB) {
      return 1;
    }

    return 0;
  };

export const sortArray = <T>(
  records: T[],
  sortField: keyof T,
  sortOrder: "asc" | "desc" = "asc"
): T[] => {
  if (sortOrder === "asc") {
    return records.sort(compareByName(sortField, sortOrder));
  }

  return records.sort(compareByName(sortField, sortOrder));
};
