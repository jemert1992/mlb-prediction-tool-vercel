import { FC } from 'react';
import Link from 'next/link';
import { format, addDays, subDays } from 'date-fns';

interface DateNavigationProps {
  currentDate: Date;
}

const DateNavigation: FC<DateNavigationProps> = ({ currentDate }) => {
  const previousDate = subDays(currentDate, 1);
  const nextDate = addDays(currentDate, 1);
  
  const formattedCurrentDate = format(currentDate, 'EEEE, MMMM d, yyyy');
  const formattedPreviousDate = format(previousDate, 'yyyy-MM-dd');
  const formattedNextDate = format(nextDate, 'yyyy-MM-dd');
  
  return (
    <div className="flex items-center justify-center w-full max-w-6xl">
      <Link 
        href={`/?date=${formattedPreviousDate}`}
        className="bg-navy-800 hover:bg-navy-900 text-white font-bold py-2 px-4 rounded-l"
      >
        &lt; Previous Day
      </Link>
      
      <div className="bg-white text-navy-800 font-bold py-2 px-6 border-t border-b">
        {formattedCurrentDate}
      </div>
      
      <Link 
        href={`/?date=${formattedNextDate}`}
        className="bg-navy-800 hover:bg-navy-900 text-white font-bold py-2 px-4 rounded-r"
      >
        Next Day &gt;
      </Link>
    </div>
  );
};

export default DateNavigation;
