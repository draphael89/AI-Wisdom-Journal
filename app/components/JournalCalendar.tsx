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
}

// Define the structure of a calendar event
interface CalendarEvent extends Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
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
          // DEBUG: Log user ID before fetching entries
          console.log('Fetching entries for user:', user.uid);
          
          const fetchedEntries = await getJournalEntries(user.uid);
          
          // DEBUG: Log the number of entries fetched
          console.log('Fetched entries:', fetchedEntries.length);
          
          // Transform the fetched entries to match the JournalEntry interface
          const transformedEntries: JournalEntry[] = fetchedEntries.map(entry => ({
            id: entry.id,
            content: entry.content,
            createdAt: entry.createdAt.toDate(),
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
  }));

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
        </motion.div>
      )}
    </motion.div>
  );
};

export default JournalCalendar;