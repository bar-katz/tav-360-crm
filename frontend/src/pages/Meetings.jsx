import React, { useState, useEffect } from "react";
import { Meeting } from "@/api/entities";
import { Contact } from "@/api/entities";
import { PropertyBrokerage } from "@/api/entities";
import { BuyersBrokerage } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Calendar } from "lucide-react";
import { motion } from "framer-motion";

import MeetingList from "../components/meetings/MeetingList";
import MeetingForm from "../components/meetings/MeetingForm";

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [properties, setProperties] = useState([]);
  const [clients, setClients] = useState([]);
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterMeetings();
  }, [meetings, searchTerm]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [meetingsData, contactsData, propertiesData, clientsData] = await Promise.all([
        Meeting.list("-start_date"),
        Contact.list(),
        PropertyBrokerage.list(),
        BuyersBrokerage.list()
      ]);
      setMeetings(meetingsData);
      setContacts(contactsData);
      setProperties(propertiesData);
      setClients(clientsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const filterMeetings = () => {
    let filtered = meetings;

    if (searchTerm) {
      filtered = filtered.filter(meeting => {
        const contact = contacts.find(c => c.id === meeting.contact_id);
        return contact?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               meeting.meeting_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               meeting.location?.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    setFilteredMeetings(filtered);
  };

  const handleSubmit = async (meetingData) => {
    try {
      if (editingMeeting) {
        await Meeting.update(editingMeeting.id, meetingData);
      } else {
        await Meeting.create(meetingData);
      }
      setShowForm(false);
      setEditingMeeting(null);
      loadData();
    } catch (error) {
      console.error("Error saving meeting:", error);
    }
  };

  const handleEdit = (meeting) => {
    setEditingMeeting(meeting);
    setShowForm(true);
  };

  const handleDelete = async (meetingId) => {
    try {
      await Meeting.delete(meetingId);
      loadData();
    } catch (error) {
      console.error("Error deleting meeting:", error);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen" style={{ direction: 'rtl' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              ניהול פגישות
            </h1>
            <p className="text-slate-600 mt-1">נהל את כל הפגישות והמפגשים</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            פגישה חדשה
          </Button>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4"
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="חפש פגישות לפי איש קשר, סוג או מיקום..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </motion.div>

          {showForm && (
            <MeetingForm
              meeting={editingMeeting}
              contacts={contacts}
              properties={properties}
              clients={clients}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingMeeting(null);
              }}
            />
          )}

          <MeetingList
            meetings={filteredMeetings}
            contacts={contacts}
            properties={properties}
            clients={clients}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}