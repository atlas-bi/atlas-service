export const RelativeDate = ({ date }: { date: string }) => {
  const thisDate = new Date(date);
  const today = new Date();

  const diffSecs = Math.round((today.valueOf() - thisDate.valueOf()) / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHrs = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHrs / 24);
  const diffWeeks = Math.round(diffDays / 7);

  if (diffSecs < 60) {
    return (
      <>
        {diffSecs} second{diffSecs > 1 && <>s</>} ago
      </>
    );
  } else if (diffMins <= 60) {
    return (
      <>
        {diffMins} minute{diffMins > 1 && <>s</>} ago
      </>
    );
  } else if (diffHrs <= 24 && today.getDay() == thisDate.getDay()) {
    return (
      <>
        {diffHrs} hour{diffHrs > 1 && <>s</>} ago
      </>
    );
  } else if (diffDays <= 7) {
    return (
      <>
        {diffDays} day{diffDays > 1 && <>s</>} ago
      </>
    );
  } else if (diffWeeks <= 4) {
    return (
      <>
        {diffWeeks} week{diffWeeks > 1 && <>s</>} ago
      </>
    );
  } else {
    const month = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'June',
      'July',
      'Aug',
      'Sept',
      'Oct',
      'Nov',
      'Dec',
    ];
    const year =
      thisDate.getFullYear() === today.getFullYear()
        ? ''
        : thisDate.getFullYear();
    return (
      <>
        {' '}
        on
        {month[thisDate.getMonth()]} {thisDate.getDay()}
        {year && <>, {year}</>}
      </>
    );
  }
};
