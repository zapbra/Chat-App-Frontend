export const stringToReadableDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
};
