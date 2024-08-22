'use client';

import { withAuth } from '../components/withAuth';
import JournalCalendar from '../components/JournalCalendar';

function CalendarPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Your Journal Entries</h1>
      <JournalCalendar />
    </div>
  );
}

export default withAuth(CalendarPage);