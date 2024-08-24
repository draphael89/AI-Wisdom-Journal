'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Event } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getJournalEntries } from '../firestore';
import { useAuth } from '../useAuth';
import { motion } from 'framer-motion';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

// Define the structure of a journal entry
interface JournalEntry {
  id: string;
  content: string;
  createdAt: Date;
  wordCount: number;
  completed: boolean;
}

// Define the structure of a calendar event
interface CalendarEvent extends Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  status: 'completed' | 'incomplete' | 'special';
}

const JournalCalendar: React.FC = () => {
  // State to store journal entries
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  // State to store the currently selected entry
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  // Get the current user
  const user = useAuth();

  // Fetch journal entries when the component mounts or the user changes
  useEffect(() => {
    const fetchEntries = async () => {
      if (user) {
        try {
          const fetchedEntries = await getJournalEntries(user.uid);
          
          // Transform the fetched entries to match the JournalEntry interface
          const transformedEntries: JournalEntry[] = fetchedEntries.map(entry => ({
            id: entry.id,
            content: entry.content,
            createdAt: entry.createdAt.toDate(),
            wordCount: entry.wordCount,
            completed: entry.completed,
          }));
          
          setEntries(transformedEntries);
        } catch (error) {
          // DEBUG: Log any errors that occur during fetching
          console.error('Error fetching journal entries:', error);
        }
      }
    };

    fetchEntries();
  }, [user]);

  // Handle the selection of an event in the calendar
  const handleSelectEvent = (event: CalendarEvent) => {
    // Find the corresponding journal entry for the selected event
    const selectedEntry = entries.find(entry => entry.id === event.id);
    if (selectedEntry) {
      setSelectedEntry(selectedEntry);
    } else {
      // DEBUG: Log if a corresponding entry is not found
      console.warn('No matching entry found for event:', event);
    }
  };

  // Transform journal entries into calendar events
  const events: CalendarEvent[] = entries.map(entry => ({
    id: entry.id,
    title: entry.content.substring(0, 30) + '...', // Truncate the content for the event title
    start: entry.createdAt,
    end: entry.createdAt,
    allDay: true,
    status: entry.completed ? 'completed' : 'incomplete',
  }));

  // Add special achievement days (e.g., streaks)
  const specialDays = calculateSpecialDays(entries);
  specialDays.forEach(day => {
    events.push({
      id: `special-${day.toISOString()}`,
      title: 'Special Achievement!',
      start: day,
      end: day,
      allDay: true,
      status: 'special',
    });
  });

  const eventStyleGetter = (event: CalendarEvent) => {
    let style: React.CSSProperties = {
      borderRadius: '50%',
      opacity: 0.8,
      color: 'white',
      border: 'none',
      display: 'block',
      textAlign: 'center',
      paddingTop: '5px',
    };

    if (event.status === 'completed') {
      style.backgroundColor = '#10B981'; // Green
    } else if (event.status === 'incomplete') {
      style.backgroundColor = '#6B7280'; // Gray
    } else if (event.status === 'special') {
      style.backgroundColor = '#F59E0B'; // Golden
    }

    return { style };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-screen flex flex-col"
    >
      {/* Render the calendar component */}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100vh - 200px)' }}
        onSelectEvent={handleSelectEvent}
        views={['month', 'week', 'day']}
        defaultView='month'
        eventPropGetter={eventStyleGetter}
      />
      {/* Render the selected entry details */}
      {selectedEntry && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
        >
          <h3 className="text-lg font-semibold mb-2">
            {moment(selectedEntry.createdAt).format('MMMM D, YYYY')}
          </h3>
          <p className="text-gray-700 dark:text-gray-300">{selectedEntry.content}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Word count: {selectedEntry.wordCount}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

function calculateSpecialDays(entries: JournalEntry[]): Date[] {
  // This is a placeholder implementation. You should implement your own logic
  // to determine special achievement days based on your requirements.
  const specialDays: Date[] = [];
  let streak = 0;
  let lastEntryDate: Date | null = null;

  entries.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  for (const entry of entries) {
    if (lastEntryDate) {
      const dayDifference = Math.floor((entry.createdAt.getTime() - lastEntryDate.getTime()) / (1000 * 60 * 60 * 24));
      if (dayDifference === 1) {
        streak++;
        if (streak % 7 === 0) { // Mark every 7-day streak as special
          specialDays.push(entry.createdAt);
        }
      } else {
        streak = 1;
      }
    } else {
      streak = 1;
    }
    lastEntryDate = entry.createdAt;
  }

  return specialDays;
}

export default JournalCalendar;